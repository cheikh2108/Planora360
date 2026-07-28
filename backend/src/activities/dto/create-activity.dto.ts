import {
  IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsArray, MinLength,
} from 'class-validator';
import { ActivityStatus } from '@prisma/client';

export class CreateActivityDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  axisId: string;

  @IsOptional()
  @IsString()
  parentActivityId?: string;

  @IsString()
  responsibleId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collaboratorIds?: string[];

  @IsDateString()
  startDate: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsEnum(['HAUTE', 'MOYENNE', 'BASSE'])
  priority?: string;

  @IsOptional()
  @IsNumber()
  budgetPlanned?: number;

  @IsOptional()
  @IsString()
  risks?: string;
}
