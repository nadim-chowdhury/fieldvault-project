import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { MaintenanceLog, MaintenanceStatus } from './entities/maintenance-log.entity';
import { Asset } from '../assets/entities/asset.entity';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceLog)
    private readonly maintenanceRepo: Repository<MaintenanceLog>,
    @InjectRepository(Asset)
    private readonly assetsRepo: Repository<Asset>,
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
}
