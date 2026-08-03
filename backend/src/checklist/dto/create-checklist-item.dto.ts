import { IsString, IsOptional, IsBoolean, IsDateString, IsNumber, MinLength } from 'class-validator';

export class CreateChecklistItemDto {
  @IsString()
  @MinLength(2)
  label!: string;

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
  order?: number;
}
