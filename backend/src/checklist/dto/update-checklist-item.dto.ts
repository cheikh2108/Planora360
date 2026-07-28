import { IsString, IsOptional, IsBoolean, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class UpdateChecklistItemDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsBoolean()
  isValidated?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
