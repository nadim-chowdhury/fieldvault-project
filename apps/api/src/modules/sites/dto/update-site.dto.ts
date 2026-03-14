import { PartialType } from '@nestjs/swagger';
import { CreateSiteDto } from './create-site.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSiteDto extends PartialType(CreateSiteDto) {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
