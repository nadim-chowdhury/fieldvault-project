import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller({ path: 'companies', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current company details' })
  async getMyCompany(@CurrentUser() user: User) {
    return this.companiesService.findOne(user.companyId);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get company statistics' })
  async getStats(@CurrentUser() user: User) {
    return this.companiesService.getStats(user.companyId);
  }

  @Patch('me')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update company details (admin only)' })
  async updateMyCompany(
    @CurrentUser() user: User,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(user.companyId, dto);
  }

  // ─── Multi-Company Endpoints ─────────────────────────

  @Get('my-companies')
  @ApiOperation({ summary: 'List all companies the user belongs to' })
  async listMyCompanies(@CurrentUser() user: User) {
    return this.companiesService.listUserCompanies(user.id);
  }

  @Post('switch')
  @ApiOperation({ summary: 'Switch active company' })
  async switchCompany(
    @CurrentUser() user: User,
    @Body() body: { companyId: string },
  ) {
    return this.companiesService.switchCompany(user.id, body.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  async createCompany(
    @CurrentUser() user: User,
    @Body() body: { name: string },
  ) {
    return this.companiesService.createCompany(user.id, body);
  }
}
