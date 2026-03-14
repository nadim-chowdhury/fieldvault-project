import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './entities/site.entity';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private readonly sitesRepository: Repository<Site>,
  ) {}

  async create(companyId: string, createSiteDto: CreateSiteDto): Promise<Site> {
    const site = this.sitesRepository.create({
      ...createSiteDto,
      companyId,
    });
    return this.sitesRepository.save(site);
  }

  findAll(companyId: string): Promise<Site[]> {
    return this.sitesRepository.find({
      where: { companyId },
      order: { name: 'ASC' },
      relations: ['assets'],
    });
  }

  async findOne(companyId: string, id: string): Promise<Site> {
    const site = await this.sitesRepository.findOne({
      where: { id, companyId },
      relations: ['assets'],
    });
    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }
    return site;
  }

  async update(companyId: string, id: string, updateSiteDto: UpdateSiteDto): Promise<Site> {
    const site = await this.findOne(companyId, id);
    Object.assign(site, updateSiteDto);
    return this.sitesRepository.save(site);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const site = await this.findOne(companyId, id);
    await this.sitesRepository.remove(site);
  }
}
