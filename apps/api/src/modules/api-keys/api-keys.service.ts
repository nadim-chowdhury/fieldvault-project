import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeysRepo: Repository<ApiKey>,
  ) {}

  async create(companyId: string, userId: string, dto: CreateApiKeyDto): Promise<{ apiKey: ApiKey; token: string }> {
    // Generate a secure random string (e.g., fv_test_XXXXXXXXXXXXXXXX)
    const rawToken = 'fv_api_' + crypto.randomBytes(32).toString('base64url');
    
    // In a real production app we might only store a hash of the token, 
    // but for business ease of use we will store the token (or consider bcrypting it).
    // Given the startup MVP scope we can store it securely but raw locally, or hash it.
    // Let's store raw for now and index it directly.
    const key = this.apiKeysRepo.create({
      name: dto.name,
      token: rawToken,
      companyId,
      createdById: userId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    await this.apiKeysRepo.save(key);
    
    return { apiKey: key, token: rawToken };
  }

  async findAll(companyId: string): Promise<ApiKey[]> {
    return this.apiKeysRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async revoke(id: string, companyId: string): Promise<void> {
    const key = await this.apiKeysRepo.findOne({ where: { id, companyId } });
    if (!key) throw new NotFoundException('API Key not found');
    
    key.isActive = false;
    await this.apiKeysRepo.save(key);
  }

  async validateKey(token: string): Promise<ApiKey | null> {
    const key = await this.apiKeysRepo.findOne({ 
      where: { token, isActive: true },
      relations: ['company']
    });

    if (!key) return null;
    if (key.expiresAt && key.expiresAt < new Date()) {
        key.isActive = false;
        await this.apiKeysRepo.save(key);
        return null;
    }

    // Update last used asynchronously
    this.apiKeysRepo.update(key.id, { lastUsedAt: new Date() }).catch(() => {});
    return key;
  }
}

