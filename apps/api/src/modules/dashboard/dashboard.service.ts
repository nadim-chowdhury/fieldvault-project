import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual } from 'typeorm';
import { Asset, AssetStatus } from '../assets/entities/asset.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { MaintenanceLog, MaintenanceStatus } from '../maintenance/entities/maintenance-log.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepo: Repository<Asset>,
    @InjectRepository(Assignment)
    private readonly assignmentsRepo: Repository<Assignment>,
    @InjectRepository(MaintenanceLog)
    private readonly maintenanceRepo: Repository<MaintenanceLog>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async getStats(companyId: string) {
    const [
      totalAssets,
      availableAssets,
      inUseAssets,
      maintenanceAssets,
      lostAssets,
      activeAssignments,
      totalUsers,
      overdueMaintenanceCount,
    ] = await Promise.all([
      this.assetsRepo.count({ where: { companyId, isArchived: false } }),
      this.assetsRepo.count({ where: { companyId, status: AssetStatus.AVAILABLE, isArchived: false } }),
      this.assetsRepo.count({ where: { companyId, status: AssetStatus.IN_USE, isArchived: false } }),
      this.assetsRepo.count({ where: { companyId, status: AssetStatus.MAINTENANCE, isArchived: false } }),
      this.assetsRepo.count({ where: { companyId, status: AssetStatus.LOST, isArchived: false } }),
      this.assignmentsRepo.count({ where: { companyId, checkedInAt: IsNull() as any } }),
      this.usersRepo.count({ where: { companyId, isActive: true } }),
      this.maintenanceRepo.count({
        where: {
          companyId,
          status: MaintenanceStatus.SCHEDULED,
          scheduledDate: LessThanOrEqual(new Date()) as any,
        },
      }),
    ]);

    // Total asset value
    const valueResult = await this.assetsRepo
      .createQueryBuilder('asset')
      .select('COALESCE(SUM(asset.purchase_value), 0)', 'totalValue')
      .where('asset.company_id = :companyId', { companyId })
      .andWhere('asset.is_archived = false')
      .getRawOne();

    // Recent assignments
    const recentAssignments = await this.assignmentsRepo.find({
      where: { companyId },
      relations: ['asset', 'user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      assets: {
        total: totalAssets,
        available: availableAssets,
        inUse: inUseAssets,
        maintenance: maintenanceAssets,
        lost: lostAssets,
        totalValue: parseFloat(valueResult?.totalValue || '0'),
      },
      assignments: {
        active: activeAssignments,
        recent: recentAssignments,
      },
      maintenance: {
        overdue: overdueMaintenanceCount,
      },
      team: {
        totalUsers,
      },
    };
  }
}
