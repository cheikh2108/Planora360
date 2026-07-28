import { Type } from 'class-transformer';
import {
  IsString, IsOptional, IsDateString, IsDecimal, MinLength, IsArray, ValidateNested,
} from 'class-validator';

export class CreateAxisDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsOptional()
  order?: number;
}

export class CreateActionPlanDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsOptional()
  @IsString()
  strategicGoals?: string;

  @IsOptional()
  @IsString()
  expectedResults?: string;

  @IsOptional()
  budgetPrevisional?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAxisDto)
  axes?: CreateAxisDto[];
}
