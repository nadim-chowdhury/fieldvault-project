import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Company, CompanyPlan } from './entities/company.entity';
import { CompanyMembership, MembershipRole } from './entities/company-membership.entity';
import { User } from '../users/entities/user.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
    @InjectRepository(CompanyMembership)
    private readonly membershipsRepo: Repository<CompanyMembership>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, dto);
    return this.companiesRepo.save(company);
  }

  async getStats(companyId: string) {
    const company = await this.companiesRepo.findOne({
      where: { id: companyId },
      relations: ['users', 'assets'],
    });
    if (!company) throw new NotFoundException('Company not found');

    return {
      totalUsers: company.users?.length || 0,
      totalAssets: company.assets?.length || 0,
      plan: company.plan,
      isActive: company.isActive,
      trialEndsAt: company.trialEndsAt,
    };
  }

  // ─── Multi-Company Methods ──────────────────────────

  async listUserCompanies(userId: string) {
    const memberships = await this.membershipsRepo.find({
      where: { userId },
      relations: ['company'],
      order: { isDefault: 'DESC', joinedAt: 'ASC' },
    });
    return memberships.map((m) => ({
      ...m.company,
      membershipRole: m.role,
      isDefault: m.isDefault,
    }));
  }

  async switchCompany(userId: string, companyId: string) {
    const membership = await this.membershipsRepo.findOne({
      where: { userId, companyId },
      relations: ['company'],
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this company');
    }

    // Update user's active company and role
    await this.usersRepo.update(userId, {
      companyId: membership.companyId,
      role: membership.role as any,
    });

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Generate new tokens with updated companyId
    const payload = {
      sub: user.id,
      email: user.email,
      role: membership.role,
      companyId: membership.companyId,
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

    this.logger.log(`User ${userId} switched to company ${companyId}`);

    return {
      tokens: { accessToken, refreshToken },
      company: membership.company,
      user: { ...user, companyId: membership.companyId, role: membership.role },
    };
  }

  async createCompany(userId: string, dto: { name: string }) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const company = this.companiesRepo.create({
      name: dto.name,
      slug: `${slug}-${Date.now().toString(36)}`,
      plan: CompanyPlan.STARTER,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });
    await this.companiesRepo.save(company);

    // Create membership as admin
    const membership = this.membershipsRepo.create({
      userId,
      companyId: company.id,
      role: MembershipRole.ADMIN,
      isDefault: false,
    });
    await this.membershipsRepo.save(membership);

    this.logger.log(`User ${userId} created new company: ${company.name} (${company.id})`);

    return company;
  }
}
