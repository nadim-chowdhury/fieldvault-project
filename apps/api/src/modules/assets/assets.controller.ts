import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { AssetStatus } from './entities/asset.entity';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller({ path: 'assets', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: 'List all assets (paginated, searchable, filterable)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: AssetStatus, required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('status') status?: AssetStatus,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.assetsService.findAll(user.companyId, { search, status, category, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID with relations' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assetsService.findOne(id, user.companyId);
  }

  @Get(':id/qr-code')
  @ApiOperation({ summary: 'Get QR code for an asset' })
  async getQrCode(@Param('id') id: string, @CurrentUser() user: User) {
    const qrCode = await this.assetsService.getQrCode(id, user.companyId);
    return { qrCode };
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Create a new asset' })
  async create(@Body() dto: CreateAssetDto, @CurrentUser() user: User) {
    return this.assetsService.create(dto, user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Update an asset' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Archive an asset (soft delete)' })
  async archive(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assetsService.archive(id, user.companyId);
  }
}
