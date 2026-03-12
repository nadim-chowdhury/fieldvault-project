import { Controller, Get, Query, UseGuards, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiProduces } from '@nestjs/swagger';
import { Response } from 'express';
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
  @ApiOperation({ summary: 'Generate audit compliance report (JSON data)' })
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

  @Get('audit/pdf')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Download audit compliance report as PDF' })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'months', required: false, type: Number })
  async getAuditReportPdf(
    @CurrentUser() user: User,
    @Query('months') months?: number,
    @Res() res?: Response,
  ) {
    const companyName = user.company?.name || 'FieldVault';
    const pdfBuffer = await this.reportsService.generateAuditPdf(
      user.companyId,
      companyName,
      months || 12,
    );

    const filename = `fieldvault-audit-report-${new Date().toISOString().split('T')[0]}.pdf`;
    res!.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res!.end(pdfBuffer);
  }

  @Get('inventory')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Generate asset inventory report grouped by category' })
  async getInventoryReport(@CurrentUser() user: User) {
    return this.reportsService.generateAssetInventory(user.companyId);
  }
}

