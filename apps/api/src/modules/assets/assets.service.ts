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

  async getQrCodeSvg(id: string, companyId: string): Promise<string> {
    const asset = await this.findOne(id, companyId);
    return this.qrCodeService.generateQrCodeSvg(id);
  }

  async generateBulkQrSheet(assetIds: string[], companyId: string, companyName: string): Promise<string> {
    const assets = await this.assetsRepo.find({
      where: { companyId },
    });
    const requestedAssets = assets.filter(a => assetIds.includes(a.id));
    
    // Generate SVGs for high quality print
    const qrItems = await Promise.all(requestedAssets.map(async (asset) => {
      const svg = await this.qrCodeService.generateQrCodeSvg(asset.id);
      return { asset, svg };
    }));

    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 0; background: #fff; }
    .sheet {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 20px;
      padding: 40px;
      width: 210mm;
      min-height: 297mm;
      box-sizing: border-box;
      margin: 0 auto;
    }
    .label {
      border: 2px dashed #ccc;
      padding: 15px;
      text-align: center;
      page-break-inside: avoid;
    }
    .qr-svg svg { width: 120px; height: 120px; }
    .company { font-weight: bold; font-size: 14px; margin-bottom: 8px; }
    .name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
    .serial { font-size: 12px; color: #666; }
    @media print {
      body { margin: 0; padding: 0; }
      .sheet { padding: 10px; width: 100%; border: none; }
      .label { border: 1px dashed #ccc; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    ${qrItems.map(item => `
      <div class="label">
        <div class="company">${companyName}</div>
        <div class="name">${item.asset.name}</div>
        <div class="serial">SN: ${item.asset.serialNumber}</div>
        <div class="qr-svg">${item.svg}</div>
      </div>
    `).join('')}
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
  }
}
