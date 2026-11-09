// Utilisé par CommissionsController (POST /passation/commissions et POST /:id/membres)
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCommissionDto {
  @IsString()
  @IsNotEmpty()
  procedureId: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom de la commission est obligatoire' })
  @MaxLength(200)
  nom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le type de commission est obligatoire' })
  @MaxLength(100)
  type: string;

  @IsDateString({}, { message: 'Date de séance invalide' })
  dateSeance: string;

  /** Président (membre de l'organisation) ; par défaut l'auteur de la création. */
  @IsOptional()
  @IsString()
  presidentId?: string;
}

export const MEMBRE_ROLES = [
  'PRESIDENT',
  'RAPPORTEUR',
  'MEMBRE',
  'OBSERVATEUR',
  'EXPERT',
];

export class AddMembreDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsIn(MEMBRE_ROLES, { message: `Rôle invalide (${MEMBRE_ROLES.join(', ')})` })
  role: string;
}
