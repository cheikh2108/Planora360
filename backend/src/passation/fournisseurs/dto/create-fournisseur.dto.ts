import { IsString, IsOptional, IsEmail, IsEnum, IsArray } from 'class-validator';
import { StatusFournisseur } from '@prisma/client';

/**
 * DTO pour la création d'un fournisseur
 */
export class CreateFournisseurDto {
  @IsString()
  raisonSociale: string;

  @IsOptional()
  @IsString()
  identifiantFiscal?: string;

  @IsOptional()
  @IsString()
  registreCommerce?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  pays?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  nomContact?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  domainesActivite?: string[];

  @IsOptional()
  @IsEnum(StatusFournisseur)
  status?: StatusFournisseur;
}
