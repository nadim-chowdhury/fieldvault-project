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
import { Company } from '../../companies/entities/company.entity';

export enum DocumentType {
  INSURANCE = 'insurance',
  CERTIFICATE = 'certificate',
  MANUAL = 'manual',
  OTHER = 'other',
}

@Entity('documents')
@Index(['companyId'])
@Index(['assetId'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'asset_id' })
  assetId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: DocumentType, default: DocumentType.OTHER })
  type: DocumentType;

  @Column({ name: 'file_url', length: 500 })
  fileUrl: string;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Relations ────────────────────────────────────
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Asset, (asset) => asset.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;
}
