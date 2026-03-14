import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { MaintenanceLog } from '../../maintenance/entities/maintenance-log.entity';
import { Site } from '../../sites/entities/site.entity';
import { Document } from '../../documents/entities/document.entity';

export enum AssetStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  LOST = 'lost',
}

export enum AssetCategory {
  POWER_TOOL = 'power_tool',
  HEAVY_EQUIPMENT = 'heavy_equipment',
  HAND_TOOL = 'hand_tool',
  SAFETY_GEAR = 'safety_gear',
  MEASURING = 'measuring',
  VEHICLE = 'vehicle',
}

@Entity('assets')
@Index(['companyId'])
@Index(['companyId', 'status'])
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'site_id', type: 'uuid', nullable: true })
  siteId: string | null;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'serial_number', length: 100, unique: true })
  serialNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string | null;

  @Column({ type: 'enum', enum: AssetCategory })
  category: AssetCategory;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.AVAILABLE })
  status: AssetStatus;

  @Column({ name: 'qr_code_url', type: 'varchar', nullable: true })
  qrCodeUrl: string | null;

  @Column({ name: 'photo_url', type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ name: 'purchase_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchaseValue: number | null;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate: Date | null;

  @Column({ name: 'warranty_expires_at', type: 'date', nullable: true })
  warrantyExpiresAt: Date | null;

  @Column({ name: 'last_inspected_at', type: 'timestamptz', nullable: true })
  lastInspectedAt: Date | null;

  @Column({ name: 'next_maintenance_date', type: 'date', nullable: true })
  nextMaintenanceDate: Date | null;

  @Column({ name: 'maintenance_interval_days', type: 'int', nullable: true })
  maintenanceIntervalDays: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Relations ────────────────────────────────────
  @ManyToOne(() => Company, (company) => company.assets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Site, (site) => site.assets, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'site_id' })
  site: Site | null;

  @OneToMany(() => Assignment, (assignment) => assignment.asset)
  assignments: Assignment[];

  @OneToMany(() => Document, (doc) => doc.asset)
  documents: Document[];

  @OneToMany(() => MaintenanceLog, (log) => log.asset)
  maintenanceLogs: MaintenanceLog[];
}
