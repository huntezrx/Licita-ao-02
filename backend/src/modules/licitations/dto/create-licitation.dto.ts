import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';
import { LicitationModality, LicitationStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateLicitationDto {
  @ApiProperty({ example: 'PE-2024-001' })
  @IsString()
  number: string;

  @ApiProperty({ example: 'Aquisição de equipamentos de TI' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Ministério da Saúde' })
  @IsString()
  organ: string;

  @ApiProperty({ enum: LicitationModality })
  @IsEnum(LicitationModality)
  modality: LicitationModality;

  @ApiPropertyOptional({ enum: LicitationStatus })
  @IsOptional()
  @IsEnum(LicitationStatus)
  status?: LicitationStatus;

  @ApiPropertyOptional({ example: 150000.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  closingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  editalUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pncpId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comprasnetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class UpdateLicitationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organ?: string;

  @ApiPropertyOptional({ enum: LicitationModality })
  @IsOptional()
  @IsEnum(LicitationModality)
  modality?: LicitationModality;

  @ApiPropertyOptional({ enum: LicitationStatus })
  @IsOptional()
  @IsEnum(LicitationStatus)
  status?: LicitationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  finalValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  closingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  editalUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class FilterLicitationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: LicitationStatus })
  @IsOptional()
  @IsEnum(LicitationStatus)
  status?: LicitationStatus;

  @ApiPropertyOptional({ enum: LicitationModality })
  @IsOptional()
  @IsEnum(LicitationModality)
  modality?: LicitationModality;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
