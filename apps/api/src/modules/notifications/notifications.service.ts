import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
  ) {}

  async findAll(companyId: string, userId?: string): Promise<Notification[]> {
    const where: any = { companyId };
    if (userId) where.userId = userId;

    return this.notificationsRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
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
    return this.notificationsRepo.save(notification);
  }
}
