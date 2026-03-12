import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Asset } from '../assets/entities/asset.entity';
import { MaintenanceLog, MaintenanceStatus } from '../maintenance/entities/maintenance-log.entity';
import { Assignment } from '../assignments/entities/assignment.entity';

export interface AuditReportData {
  company: { name: string; generatedAt: string };
  period: { from: string; to: string };
  assets: {
    id: string;
    name: string;
    serialNumber: string;
    category: string;
    status: string;
    lastInspectedAt: string | null;
  }[];
  maintenanceLogs: {
    assetName: string;
    type: string;
    status: string;
    scheduledDate: string;
    completedAt: string | null;
    performedBy: string | null;
  }[];
  summary: {
    totalAssets: number;
    totalMaintenanceLogs: number;
    completedMaintenance: number;
    overdueMaintenance: number;
    complianceRate: string;
  };
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepo: Repository<Asset>,
    @InjectRepository(MaintenanceLog)
    private readonly maintenanceRepo: Repository<MaintenanceLog>,
    @InjectRepository(Assignment)
    private readonly assignmentsRepo: Repository<Assignment>,
  ) {}

  async generateAuditReport(companyId: string, months: number = 12): Promise<AuditReportData> {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - months);

    const [assets, maintenanceLogs] = await Promise.all([
      this.assetsRepo.find({
        where: { companyId, isArchived: false },
        order: { name: 'ASC' },
      }),
      this.maintenanceRepo.find({
        where: {
          companyId,
          scheduledDate: Between(fromDate, toDate) as any,
        },
        relations: ['asset'],
        order: { scheduledDate: 'DESC' },
      }),
    ]);

    const completedCount = maintenanceLogs.filter(
      (l) => l.status === MaintenanceStatus.COMPLETED,
    ).length;
    const overdueCount = maintenanceLogs.filter(
      (l) => l.status === MaintenanceStatus.SCHEDULED && new Date(l.scheduledDate) < new Date(),
    ).length;
    const complianceRate = maintenanceLogs.length > 0
      ? ((completedCount / maintenanceLogs.length) * 100).toFixed(1)
      : '100.0';

    this.logger.log(`Audit report generated for company ${companyId} (${months} months)`);

    return {
      company: {
        name: '', // Filled by controller
        generatedAt: new Date().toISOString(),
      },
      period: {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
      },
      assets: assets.map((a) => ({
        id: a.id,
        name: a.name,
        serialNumber: a.serialNumber,
        category: a.category,
        status: a.status,
        lastInspectedAt: a.lastInspectedAt?.toISOString() ?? null,
      })),
      maintenanceLogs: maintenanceLogs.map((l) => ({
        assetName: l.asset?.name || 'Unknown',
        type: l.type,
        status: l.status,
        scheduledDate: l.scheduledDate.toString(),
        completedAt: l.completedAt?.toISOString() ?? null,
        performedBy: l.performedBy ?? null,
      })),
      summary: {
        totalAssets: assets.length,
        totalMaintenanceLogs: maintenanceLogs.length,
        completedMaintenance: completedCount,
        overdueMaintenance: overdueCount,
        complianceRate: `${complianceRate}%`,
      },
    };
  }

  async generateAssetInventory(companyId: string) {
    const assets = await this.assetsRepo.find({
      where: { companyId, isArchived: false },
      order: { category: 'ASC', name: 'ASC' },
    });

    const byCategory: Record<string, typeof assets> = {};
    for (const asset of assets) {
      if (!byCategory[asset.category]) byCategory[asset.category] = [];
      byCategory[asset.category].push(asset);
    }

    return {
      generatedAt: new Date().toISOString(),
      totalAssets: assets.length,
      byCategory,
    };
  }
}
