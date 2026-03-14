import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  create(@Req() req: any, @Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeysService.create(req.user.companyId, req.user.id, createApiKeyDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys for the company' })
  findAll(@Req() req: any) {
    return this.apiKeysService.findAll(req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.apiKeysService.revoke(id, req.user.companyId);
  }
}

