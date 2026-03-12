import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
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
}
