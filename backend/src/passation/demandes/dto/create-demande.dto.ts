// Utilisé par DemandesController (POST /passation/demandes)
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateDemandeDto {
  @IsString()
  @IsNotEmpty({ message: 'L\'objet est obligatoire' })
  @MaxLength(300)
  objet: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'La justification est obligatoire' })
  justification: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Le montant estimatif doit être un nombre' })
  @Min(0, { message: 'Le montant estimatif ne peut pas être négatif' })
  montantEstimatif: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantite?: number;

  @IsOptional()
  @IsString()
  specifications?: string;

  @IsOptional()
  @IsString()
  ligneBudgetaire?: string;

  @IsOptional()
  @IsString()
  sourceFinancement?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Échéance souhaitée invalide' })
  echeanceSouhaitee?: string;

  @IsOptional()
  @IsString()
  lignePpmId?: string;

  @IsOptional()
  @IsString()
  activityId?: string;
}
