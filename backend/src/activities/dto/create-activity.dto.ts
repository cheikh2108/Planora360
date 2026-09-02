import {
  IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsArray, MinLength,
} from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  expectedResults?: string;

  @IsString()
  axisId!: string;

  @IsOptional()
  @IsString()
  parentActivityId?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collaboratorIds?: string[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(['HAUTE', 'NORMALE', 'BASSE', 'CRITIQUE'])
  priority?: string;

  @IsOptional()
  @IsNumber()
  budgetPlanned?: number;

  @IsOptional()
  @IsString()
  risks?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;
}
