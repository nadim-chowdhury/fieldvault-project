import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Asset } from '../../assets/entities/asset.entity';

export enum CompanyPlan {
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string | null;

  @Column({ length: 20, nullable: true })
  phone: string | null;

  @Column({ length: 500, nullable: true })
  address: string | null;

  @Column({ length: 100, nullable: true })
  country: string | null;

  @Column({ length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'enum', enum: CompanyPlan, default: CompanyPlan.STARTER })
  plan: CompanyPlan;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'trial_ends_at', type: 'timestamptz', nullable: true })
  trialEndsAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Relations ────────────────────────────────────
  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Asset, (asset) => asset.company)
  assets: Asset[];
}
