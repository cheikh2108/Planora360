import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';

export class FilterCapitalizationDto {
  @IsOptional()
  @IsEnum(['BONNE_PRATIQUE', 'RECIT_CHANGEMENT', 'GUIDE'])
  type?: string;

  @IsOptional()
  @IsEnum(['BROUILLON', 'PUBLIE'])
  status?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  search?: string;
}
