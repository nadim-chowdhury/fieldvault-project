import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { MaintenanceLog, MaintenanceStatus } from './entities/maintenance-log.entity';
import { Asset } from '../assets/entities/asset.entity';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/maintenance.dto';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { Logger } from '@nestjs/common';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @InjectRepository(MaintenanceLog)
    private readonly maintenanceRepo: Repository<MaintenanceLog>,
    @InjectRepository(Asset)
    private readonly assetsRepo: Repository<Asset>,
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(companyId: string, options?: { page?: number; limit?: number }) {
    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options?.limit) || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await this.maintenanceRepo.findAndCount({
      where: { companyId },
      relations: ['asset'],
      order: { scheduledDate: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOverdue(companyId: string): Promise<MaintenanceLog[]> {
    return this.maintenanceRepo.find({
      where: {
        companyId,
        status: MaintenanceStatus.SCHEDULED,
        scheduledDate: LessThanOrEqual(new Date()),
      },
      relations: ['asset'],
    });
  }

  async findOne(id: string, companyId: string): Promise<MaintenanceLog> {
    const log = await this.maintenanceRepo.findOne({
      where: { id, companyId },
      relations: ['asset'],
    });
    if (!log) throw new NotFoundException('Maintenance log not found');
    return log;
  }

  async create(dto: CreateMaintenanceDto, companyId: string): Promise<MaintenanceLog> {
    // Verify asset belongs to company
    const asset = await this.assetsRepo.findOne({
      where: { id: dto.assetId, companyId },
    });
    if (!asset) throw new NotFoundException('Asset not found');

    const log = this.maintenanceRepo.create({
      ...dto,
      companyId,
    });
    return this.maintenanceRepo.save(log);
  }

  async update(id: string, companyId: string, dto: UpdateMaintenanceDto): Promise<MaintenanceLog> {
    const log = await this.findOne(id, companyId);

    if (dto.completedAt) {
      log.completedAt = new Date(dto.completedAt);
    }
    if (dto.status) log.status = dto.status;
    if (dto.performedBy) log.performedBy = dto.performedBy;
    if (dto.cost !== undefined) log.cost = dto.cost;
    if (dto.technicianNotes) log.technicianNotes = dto.technicianNotes;

    // If completed, update asset's last inspected date and calculate next maintenance
    if (dto.status === MaintenanceStatus.COMPLETED) {
      const asset = await this.assetsRepo.findOne({ where: { id: log.assetId } });
      if (asset) {
        asset.lastInspectedAt = new Date();
        if (asset.maintenanceIntervalDays) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + asset.maintenanceIntervalDays);
          asset.nextMaintenanceDate = nextDate;
        }
        await this.assetsRepo.save(asset);
      }
    }

    return this.maintenanceRepo.save(log);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const log = await this.findOne(id, companyId);
    await this.maintenanceRepo.remove(log);
  }

  @Cron('0 0 8 * * *') // Run every day at 8:00 AM
  async checkDailyMaintenanceAlerts() {
    this.logger.log('Running daily automated maintenance checks...');
    
    // Find all active companies
    const companies = await this.companiesRepo.find({ where: { isActive: true } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    let activeAlerts = 0;

    for (const company of companies) {
      // Find all scheduled maintenance logs for this company
      const logs = await this.maintenanceRepo.find({
        where: { companyId: company.id, status: MaintenanceStatus.SCHEDULED },
        relations: ['asset'],
      });

      for (const log of logs) {
        if (!log.asset) continue;

        const scheduledDate = new Date(log.scheduledDate);
        scheduledDate.setHours(0, 0, 0, 0);

        const diffTime = scheduledDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let alertType: NotificationType | null = null;
        let title = '';
        let message = '';

        if (diffDays === 7) {
          alertType = NotificationType.MAINTENANCE_DUE;
          title = `Maintenance due in 7 days: ${log.asset.name}`;
          message = `Asset ${log.asset.name} (${log.asset.serialNumber}) is due for ${log.type} on ${log.scheduledDate.toLocaleDateString()}.`;
        } else if (diffDays < 0 && log.status !== MaintenanceStatus.OVERDUE) {
          alertType = NotificationType.MAINTENANCE_OVERDUE;
          title = `OVERDUE Maintenance: ${log.asset.name}`;
          message = `Asset ${log.asset.name} (${log.asset.serialNumber}) is overdue for ${log.type}. Scheduled date was ${log.scheduledDate.toLocaleDateString()}.`;
          
          // Mark as overdue so we don't spam them every day unless we want to.
          log.status = MaintenanceStatus.OVERDUE;
          await this.maintenanceRepo.save(log);
        }

        if (alertType) {
          // Identify the supervisor/admin for the asset/company to send to. For now, sending to company admins/supervisors.
          // In a real app we might fetch user lists here, or notify all admins. 
          // Our notification service handles email sending if userId is provided, but here we can just create a company-wide notification.
          await this.notificationsService.create({
            companyId: company.id,
            type: alertType,
            title,
            message,
            relatedEntityId: log.id,
            relatedEntityType: 'maintenance',
          });
          activeAlerts++;
        }
      }
    }

    this.logger.log(`Daily maintenance routine completed. Raised ${activeAlerts} alerts.`);
  }
}
