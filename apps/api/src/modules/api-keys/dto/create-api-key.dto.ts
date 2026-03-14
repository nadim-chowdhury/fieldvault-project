import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'ERP Integration Key' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, example: '2027-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
