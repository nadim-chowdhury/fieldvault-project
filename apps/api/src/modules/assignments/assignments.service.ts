import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Asset, AssetStatus } from '../assets/entities/asset.entity';
import { CheckoutDto, CheckinDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentsRepo: Repository<Assignment>,
    @InjectRepository(Asset)
    private readonly assetsRepo: Repository<Asset>,
  ) {}

  async findAllActive(companyId: string): Promise<Assignment[]> {
    return this.assignmentsRepo.find({
      where: { companyId, checkedInAt: IsNull() as any },
      relations: ['asset', 'user'],
      order: { checkedOutAt: 'DESC' },
    });
  }

  async findByAsset(assetId: string, companyId: string): Promise<Assignment[]> {
    return this.assignmentsRepo.find({
      where: { assetId, companyId },
      relations: ['user'],
      order: { checkedOutAt: 'DESC' },
    });
  }

  async checkout(dto: CheckoutDto, userId: string, companyId: string): Promise<Assignment> {
    const asset = await this.assetsRepo.findOne({
      where: { id: dto.assetId, companyId },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    if (asset.status !== AssetStatus.AVAILABLE) {
      throw new BadRequestException(`Asset is currently ${asset.status} and cannot be checked out`);
    }

    // Create assignment
    const assignment = this.assignmentsRepo.create({
      assetId: dto.assetId,
      userId,
      companyId,
      siteLocation: dto.siteLocation,
      conditionOnCheckout: dto.conditionOnCheckout,
      notes: dto.notes,
      checkedOutAt: new Date(),
    });
    await this.assignmentsRepo.save(assignment);

    // Update asset status
    asset.status = AssetStatus.IN_USE;
    await this.assetsRepo.save(asset);

    return assignment;
  }

  async checkin(assignmentId: string, dto: CheckinDto, companyId: string): Promise<Assignment> {
    const assignment = await this.assignmentsRepo.findOne({
      where: { id: assignmentId, companyId },
      relations: ['asset'],
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.checkedInAt) throw new BadRequestException('Already checked in');

    // Update assignment
    assignment.checkedInAt = new Date();
    assignment.conditionOnReturn = dto.conditionOnReturn ?? null;
    if (dto.notes) assignment.notes = dto.notes;
    await this.assignmentsRepo.save(assignment);

    // Update asset status back to available
    assignment.asset.status = AssetStatus.AVAILABLE;
    await this.assetsRepo.save(assignment.asset);

    return assignment;
  }
}
