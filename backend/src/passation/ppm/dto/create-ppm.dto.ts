import { IsString, IsInt, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { StatusPPM } from '@prisma/client';

export class CreatePpmDto {
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsEnum(StatusPPM)
  status?: StatusPPM;
}
