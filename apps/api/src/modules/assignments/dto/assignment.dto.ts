import { IsString, IsUUID, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  assetId: string;

  @ApiProperty({ example: 'Gulshan Construction Site - Block A' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  siteLocation: string;

  @ApiPropertyOptional({ example: 'Good condition, fully charged' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  conditionOnCheckout?: string;

  @ApiPropertyOptional({ example: 'Needed for foundation drilling' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class CheckinDto {
  @ApiPropertyOptional({ example: 'Good condition, minor scratches' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  conditionOnReturn?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg' })
  @IsOptional()
  @IsString()
  photoOnReturnUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
