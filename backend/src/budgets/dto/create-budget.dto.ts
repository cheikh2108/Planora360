import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  @Min(0)
  planned: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  committed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  disbursed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  executed?: number;

  @IsOptional()
  @IsString()
  fundingSource?: string;
}
