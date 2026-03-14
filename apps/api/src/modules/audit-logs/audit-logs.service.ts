import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogsRepo: Repository<AuditLog>,
  ) {}

  async logEvent(data: {
    companyId?: string;
    userId?: string;
    entityName: string;
    entityId: string;
    action: AuditAction;
    oldData?: any;
    newData?: any;
  }): Promise<AuditLog> {
    const log = this.auditLogsRepo.create(data);
    return this.auditLogsRepo.save(log);
  }

  async findAll(companyId: string, options?: { entityName?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options?.limit) || 50));
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (options?.entityName) {
      where.entityName = options.entityName;
    }

    const [data, total] = await this.auditLogsRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
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
      },
    };
  }
}
