import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateActionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;
}
