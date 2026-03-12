import { IsString, IsEnum, IsOptional, IsNumber, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AssetCategory } from '../entities/asset.entity';

export class CreateAssetDto {
  @ApiProperty({ example: 'DeWalt DCD791 Drill' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'DW-2024-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  serialNumber: string;

  @ApiPropertyOptional({ example: 'DCD791' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @ApiPropertyOptional({ example: 'DeWalt' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  manufacturer?: string;

  @ApiProperty({ enum: AssetCategory, example: AssetCategory.POWER_TOOL })
  @IsEnum(AssetCategory)
  category: AssetCategory;

  @ApiPropertyOptional({ example: 299.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseValue?: number;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: '2027-01-15' })
  @IsOptional()
  @IsString()
  warrantyExpiresAt?: string;

  @ApiPropertyOptional({ example: 90, description: 'Days between maintenance' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maintenanceIntervalDays?: number;

  @ApiPropertyOptional({ example: 'Brand new, includes extra battery' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateAssetDto extends PartialType(CreateAssetDto) {}
