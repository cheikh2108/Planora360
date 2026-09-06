import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateContratDto {
  @IsString()
  @IsNotEmpty({ message: 'L\'ID de la procédure est obligatoire' })
  procedureId: string;

  @IsString()
  @IsNotEmpty({ message: 'L\'ID du fournisseur est obligatoire' })
  fournisseurId: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le montant initial doit être un nombre avec maximum 2 décimales' },
  )
  @Min(0, { message: 'Le montant initial doit être positif' })
  @IsNotEmpty({ message: 'Le montant initial est obligatoire' })
  montantInitial: number;

  @IsDateString({}, { message: 'Date de signature invalide (format ISO attendu)' })
  @IsNotEmpty({ message: 'La date de signature est obligatoire' })
  dateSignature: string;

  @IsDateString({}, { message: 'Date d\'échéance invalide (format ISO attendu)' })
  @IsNotEmpty({ message: 'La date d\'échéance est obligatoire' })
  dateEcheance: string;

  // Champs optionnels
  @IsOptional()
  @IsString()
  soumissionId?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montantRevise?: number;

  @IsOptional()
  @IsDateString()
  dateDemarrage?: string;

  @IsOptional()
  @IsDateString()
  dateReceptionProv?: string;

  @IsOptional()
  @IsDateString()
  dateReceptionDef?: string;

  @IsOptional()
  @IsString()
  modalitesAvance?: string;

  @IsOptional()
  @IsString()
  modalitesAcompte?: string;

  @IsOptional()
  @IsString()
  modalitesRetenue?: string;

  @IsOptional()
  @IsString()
  garanties?: string;

  @IsOptional()
  @IsString()
  devise?: string;
}
