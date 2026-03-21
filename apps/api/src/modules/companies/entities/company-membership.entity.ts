import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from './company.entity';

export enum MembershipRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  WORKER = 'worker',
}

@Entity('company_memberships')
@Unique(['userId', 'companyId'])
@Index(['userId'])
@Index(['companyId'])
export class CompanyMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ type: 'enum', enum: MembershipRole, default: MembershipRole.WORKER })
  role: MembershipRole;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;

  // ─── Relations ────────────────────────────────────
  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, (company) => company.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
