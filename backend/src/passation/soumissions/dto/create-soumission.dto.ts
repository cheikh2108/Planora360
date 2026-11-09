// Utilisé par SoumissionsController (POST /passation/procedures/:procedureId/soumissions)
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSoumissionDto {
  @IsString()
  @IsNotEmpty()
  fournisseurId: string;

  @IsString()
  @IsNotEmpty({ message: 'Le numéro de dépôt est obligatoire' })
  @MaxLength(100)
  numeroDepot: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montantTechnique?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montantFinancier: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montantTotal: number;

  @IsOptional()
  @IsIn(['XOF', 'XAF', 'GNF', 'EUR', 'USD'])
  devise?: string;

  @IsOptional()
  @IsBoolean()
  conformeAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  conformeTechnique?: boolean;

  @IsOptional()
  @IsBoolean()
  conformeFinancier?: boolean;

  @IsOptional()
  @IsBoolean()
  horsDelai?: boolean;

  /** Une offre est toujours enregistrée « DEPOSEE » (champ accepté pour compatibilité avec l'écran). */
  @IsOptional()
  @IsIn(['DEPOSEE'])
  status?: string;
}
