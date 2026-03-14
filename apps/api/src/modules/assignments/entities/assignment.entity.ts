import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';
import { User } from '../../users/entities/user.entity';

@Entity('assignments')
@Index(['companyId'])
@Index(['companyId', 'checkedInAt'])
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_id' })
  assetId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'site_location', length: 200 })
  siteLocation: string;

  @Column({ name: 'checked_out_at', type: 'timestamptz' })
  checkedOutAt: Date;

  @Column({ name: 'checked_in_at', type: 'timestamptz', nullable: true })
  checkedInAt: Date | null;

  @Column({ name: 'condition_on_checkout', type: 'varchar', length: 500, nullable: true })
  conditionOnCheckout: string | null;

  @Column({ name: 'condition_on_return', type: 'varchar', length: 500, nullable: true })
  conditionOnReturn: string | null;

  @Column({ name: 'photo_on_return', type: 'varchar', nullable: true })
  photoOnReturn: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_overdue', default: false })
  isOverdue: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Relations ────────────────────────────────────
  @ManyToOne(() => Asset, (asset) => asset.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => User, (user) => user.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
