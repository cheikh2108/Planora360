import { IsString, IsOptional, IsNumber, MinLength } from 'class-validator';

export class CreateAxisDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateAxisDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}
