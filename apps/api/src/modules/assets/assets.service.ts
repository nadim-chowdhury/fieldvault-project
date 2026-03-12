import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Asset, AssetStatus } from './entities/asset.entity';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { QrCodeService } from './services/qr-code.service';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepo: Repository<Asset>,
    private readonly qrCodeService: QrCodeService,
  ) {}

  async findAll(
    companyId: string,
    filters?: { search?: string; status?: AssetStatus; category?: string; page?: number; limit?: number },
  ) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);

    const where: FindOptionsWhere<Asset> = { companyId, isArchived: false };
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category as any;

    const queryBuilder = this.assetsRepo.createQueryBuilder('asset')
      .where('asset.company_id = :companyId', { companyId })
      .andWhere('asset.is_archived = :isArchived', { isArchived: false });

    if (filters?.search) {
      queryBuilder.andWhere(
        '(asset.name ILIKE :search OR asset.serial_number ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }
    if (filters?.status) {
      queryBuilder.andWhere('asset.status = :status', { status: filters.status });
    }
    if (filters?.category) {
      queryBuilder.andWhere('asset.category = :category', { category: filters.category });
    }

    queryBuilder
      .orderBy('asset.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<Asset> {
    const asset = await this.assetsRepo.findOne({
      where: { id, companyId },
      relations: ['assignments', 'maintenanceLogs'],
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async create(dto: CreateAssetDto, companyId: string): Promise<Asset> {
    const asset = this.assetsRepo.create({
      ...dto,
      companyId,
    });
    const saved = await this.assetsRepo.save(asset);

    // Generate QR code
    const qrCodeUrl = await this.qrCodeService.generateQrCodeDataUrl(saved.id);
    saved.qrCodeUrl = qrCodeUrl;
    await this.assetsRepo.save(saved);

    return saved;
  }

  async update(id: string, companyId: string, dto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.findOne(id, companyId);
    Object.assign(asset, dto);
    return this.assetsRepo.save(asset);
  }

  async archive(id: string, companyId: string): Promise<Asset> {
    const asset = await this.findOne(id, companyId);
    asset.isArchived = true;
    return this.assetsRepo.save(asset);
  }

  async getQrCode(id: string, companyId: string): Promise<string> {
    const asset = await this.findOne(id, companyId);
    if (!asset.qrCodeUrl) {
      const qrCodeUrl = await this.qrCodeService.generateQrCodeDataUrl(id);
      asset.qrCodeUrl = qrCodeUrl;
      await this.assetsRepo.save(asset);
      return qrCodeUrl;
    }
    return asset.qrCodeUrl;
  }
}
