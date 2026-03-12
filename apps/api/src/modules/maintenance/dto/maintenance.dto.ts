import { IsString, IsEnum, IsUUID, IsOptional, IsNumber, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceType, MaintenanceStatus } from '../entities/maintenance-log.entity';

export class CreateMaintenanceDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  assetId: string;

  @ApiProperty({ enum: MaintenanceType, example: MaintenanceType.ROUTINE_SERVICE })
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiProperty({ example: '2026-04-15' })
  @IsString()
  scheduledDate: string;

  @ApiPropertyOptional({ example: 'Regular oil change and filter replacement' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 150.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;
}

export class UpdateMaintenanceDto {
  @ApiPropertyOptional({ enum: MaintenanceStatus })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ example: '2026-04-15T10:30:00Z' })
  @IsOptional()
  @IsString()
  completedAt?: string;

  @ApiPropertyOptional({ example: 'John the Technician' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  performedBy?: string;

  @ApiPropertyOptional({ example: 175.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ example: 'Replaced filter, oil at 5W-30' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  technicianNotes?: string;
}
