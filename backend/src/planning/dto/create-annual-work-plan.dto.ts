import { IsNotEmpty, IsNumber, IsString, IsObject, IsEnum, IsOptional } from 'class-validator';

export class CreateAnnualWorkPlanDto {
  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  @IsNotEmpty()
  objectives: any;

  @IsEnum(['BROUILLON', 'VALIDE'])
  @IsOptional()
  status?: string;
}
