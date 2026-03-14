import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
  ) {}

  async create(companyId: string, createDto: CreateDocumentDto): Promise<Document> {
    const document = this.documentsRepository.create({
      ...createDto,
      companyId,
    });
    return this.documentsRepository.save(document);
  }

  findAllByAsset(companyId: string, assetId: string): Promise<Document[]> {
    return this.documentsRepository.find({
      where: { companyId, assetId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id, companyId },
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async update(companyId: string, id: string, updateDto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findOne(companyId, id);
    Object.assign(document, updateDto);
    return this.documentsRepository.save(document);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const document = await this.findOne(companyId, id);
    await this.documentsRepository.remove(document);
  }
}
