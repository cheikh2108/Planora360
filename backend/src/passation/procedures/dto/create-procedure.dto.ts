import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { MethodeProcedure } from '@prisma/client';

export class CreateProcedureDto {
  @IsEnum(MethodeProcedure, {
    message: 'Méthode de procédure invalide. Valeurs acceptées : AOO, AOR, DC, GRG, AON, AOI',
  })
  @IsNotEmpty({ message: 'La méthode de passation est obligatoire' })
  methode: MethodeProcedure;

  @IsString()
  @IsNotEmpty({ message: 'L\'objet de la procédure est obligatoire' })
  objet: string;

  @IsString()
  @IsNotEmpty({ message: 'La description est obligatoire' })
  description: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le montant estimatif doit être un nombre avec maximum 2 décimales' },
  )
  @Min(0, { message: 'Le montant estimatif doit être positif' })
  @IsNotEmpty({ message: 'Le montant estimatif est obligatoire' })
  montantEstimatif: number;

  // Champs optionnels
  @IsOptional()
  @IsString()
  lignePpmId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date de publication invalide' })
  datePublication?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date limite invalide' })
  dateLimite?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date d\'ouverture invalide' })
  dateOuverture?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date de clarification invalide' })
  dateClarification?: string;
}
