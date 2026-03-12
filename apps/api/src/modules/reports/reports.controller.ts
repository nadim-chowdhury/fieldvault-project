import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller({ path: 'reports', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('audit')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Generate audit compliance report (JSON data for PDF)' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Number of months to cover (default: 12)' })
  async getAuditReport(
    @CurrentUser() user: User,
    @Query('months') months?: number,
  ) {
    const report = await this.reportsService.generateAuditReport(
      user.companyId,
      months || 12,
    );
    report.company.name = user.company?.name || '';
    return report;
  }

  @Get('inventory')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Generate asset inventory report grouped by category' })
  async getInventoryReport(@CurrentUser() user: User) {
    return this.reportsService.generateAssetInventory(user.companyId);
  }
}
