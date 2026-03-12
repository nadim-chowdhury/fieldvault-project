import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Company, CompanyPlan } from '../companies/entities/company.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Register ─────────────────────────────────────
  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create company
    const slug = dto.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const company = this.companiesRepo.create({
      name: dto.companyName,
      slug: `${slug}-${Date.now().toString(36)}`,
      plan: CompanyPlan.STARTER,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
    });
    await this.companiesRepo.save(company);

    // Create admin user
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: UserRole.ADMIN,
      companyId: company.id,
    });
    await this.usersRepo.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    this.logger.log(`New company registered: ${company.name} (${company.id})`);

    return {
      tokens,
      user: this.sanitizeUser(user),
      company,
    };
  }

  // ─── Login ────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      relations: ['company'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    // Update last login
    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });

    return {
      tokens,
      user: this.sanitizeUser(user),
      company: user.company,
    };
  }

  // ─── Refresh Token ────────────────────────────────
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['company'],
    });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return { tokens };
  }

  // ─── Logout ───────────────────────────────────────
  async logout(userId: string) {
    await this.usersRepo.update(userId, { refreshTokenHash: null as any });
  }

  // ─── Helpers ──────────────────────────────────────
  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as any, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload as any, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepo.update(userId, { refreshTokenHash: hash });
  }

  private sanitizeUser(user: User) {
    const { passwordHash, refreshTokenHash, ...sanitized } = user;
    return sanitized;
  }
}
