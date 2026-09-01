import { IsString, IsNumber, IsOptional, IsEnum, Min, Max, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { MethodeProcedure } from '@prisma/client';

export class CreateLignePpmDto {
  @IsString()
  @IsNotEmpty()
  objet: string;

  @IsNumber()
  @Type(() => Number)
  montantEstimatif: number;

  @IsEnum(MethodeProcedure)
  methodeProcedure: MethodeProcedure;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(4)
  trimestre: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  sourceFinancement?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  ligneBudgetaire?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  observations?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  activityId?: string;
}
