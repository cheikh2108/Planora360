import { IsString, IsOptional, IsNumber, IsDateString, MinLength, Min } from 'class-validator';

export class CreateIndicatorDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseline?: number;

  @IsNumber()
  @Min(0)
  target!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  achieved?: number;

  @IsOptional()
  @IsString()
  activityId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
