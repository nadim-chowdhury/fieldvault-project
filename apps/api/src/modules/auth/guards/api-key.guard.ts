import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from '../../api-keys/api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] || request.query.api_key;

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const keyEntity = await this.apiKeysService.validateKey(apiKey);
    if (!keyEntity) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    // Attach company info to request for downstream controllers
    request.user = { companyId: keyEntity.companyId, isApiKey: true, sub: keyEntity.createdById };
    return true;
  }
}
