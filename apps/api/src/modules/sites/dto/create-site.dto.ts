import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({ description: 'The name of the site' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ description: 'Physical address of the site' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;
}
