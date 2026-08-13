import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional } from 'class-validator';

export class CreateCapitalizationDto {
  @IsEnum(['BONNE_PRATIQUE', 'RECIT_CHANGEMENT', 'GUIDE'])
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  context: string;

  @IsString()
  @IsNotEmpty()
  challenges: string;

  @IsString()
  @IsNotEmpty()
  solutions: string;

  @IsString()
  @IsNotEmpty()
  results: string;

  @IsString()
  @IsNotEmpty()
  lessons: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsEnum(['BROUILLON', 'PUBLIE'])
  @IsOptional()
  status?: string;
}
