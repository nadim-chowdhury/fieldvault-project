import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  MAINTENANCE_DUE = 'maintenance_due',
  MAINTENANCE_OVERDUE = 'maintenance_overdue',
  TOOL_OVERDUE = 'tool_overdue',
  TOOL_DAMAGED = 'tool_damaged',
  USER_INVITED = 'user_invited',
  REPORT_READY = 'report_ready',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true })
  relatedEntityId: string | null;

  @Column({ name: 'related_entity_type', length: 50, nullable: true })
  relatedEntityType: string | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'email_sent', default: false })
  emailSent: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
