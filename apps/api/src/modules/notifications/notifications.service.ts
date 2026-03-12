import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../auth/services/email.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async findAll(companyId: string, userId?: string, options?: { page?: number; limit?: number }) {
    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (userId) where.userId = userId;

    const [data, total] = await this.notificationsRepo.findAndCount({
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
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async countUnread(companyId: string, userId: string): Promise<number> {
    return this.notificationsRepo.count({
      where: { companyId, userId, isRead: false },
    });
  }

  async markAsRead(id: string, companyId: string): Promise<Notification | null> {
    const notification = await this.notificationsRepo.findOne({
      where: { id, companyId },
    });
    if (!notification) return null;

    notification.isRead = true;
    return this.notificationsRepo.save(notification);
  }

  async markAllAsRead(companyId: string, userId: string): Promise<void> {
    await this.notificationsRepo.update(
      { companyId, userId, isRead: false },
      { isRead: true },
    );
  }

  async create(data: {
    companyId: string;
    userId?: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }): Promise<Notification> {
    const notification = this.notificationsRepo.create(data);
    const saved = await this.notificationsRepo.save(notification);

    // Send email for maintenance alerts
    if (
      data.userId &&
      (data.type === NotificationType.MAINTENANCE_DUE ||
        data.type === NotificationType.MAINTENANCE_OVERDUE)
    ) {
      try {
        const user = await this.usersRepo.findOne({ where: { id: data.userId } });
        if (user?.email) {
          await this.emailService.sendMaintenanceAlert(
            user.email,
            data.title,
            data.message,
          );
          await this.notificationsRepo.update(saved.id, { emailSent: true });
          saved.emailSent = true;
          this.logger.log(`Maintenance alert email sent to ${user.email}`);
        }
      } catch (error) {
        this.logger.error(`Failed to send notification email: ${error}`);
      }
    }

    return saved;
  }
}

