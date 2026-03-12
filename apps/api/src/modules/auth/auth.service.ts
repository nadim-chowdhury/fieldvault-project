import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Company, CompanyPlan } from '../companies/entities/company.entity';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { EmailService } from './services/email.service';

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
    private readonly emailService: EmailService,
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

  // ─── Decode Refresh Token ────────────────────────
  async decodeRefreshToken(refreshToken: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      return payload as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ─── Forgot Password ─────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });

    // Always return success to prevent email enumeration
    if (!user) {
      this.logger.debug(`Forgot password for non-existent email: ${dto.email}`);
      return { message: 'If an account exists, a reset link has been sent.' };
    }

    // Generate a short-lived reset token (1 hour)
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'password-reset' } as any,
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') + '-reset',
        expiresIn: '1h',
      },
    );

    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    this.logger.log(`Password reset requested for ${user.email}`);

    return { message: 'If an account exists, a reset link has been sent.' };
  }

  // ─── Reset Password ──────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') + '-reset',
      });

      if (payload.purpose !== 'password-reset') {
        throw new BadRequestException('Invalid reset token');
      }

      const passwordHash = await bcrypt.hash(dto.newPassword, 12);
      await this.usersRepo.update(payload.sub, {
        passwordHash,
        refreshTokenHash: null as any, // Invalidate all sessions
      });

      this.logger.log(`Password reset completed for user ${payload.sub}`);
      return { message: 'Password reset successfully. Please sign in.' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Reset link is invalid or expired');
    }
  }

  // ─── Change Password (authenticated) ─────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.usersRepo.update(userId, { passwordHash });

    this.logger.log(`Password changed for user ${userId}`);
    return { message: 'Password changed successfully' };
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
