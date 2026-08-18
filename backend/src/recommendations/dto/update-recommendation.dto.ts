import { IsString, IsOptional, IsDateString, IsEnum, IsInt, Min, Max } from 'class-validator';

export class UpdateRecommendationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum([
    'MISSION_SUPERVISION',
    'VISITE_TERRAIN',
    'AUDIT_INTERNE',
    'AUDIT_EXTERNE',
    'EVALUATION_PROJET',
    'EVALUATION_PROGRAMME',
    'REUNION_COORDINATION',
    'REVUE_PERFORMANCE',
    'CONTROLE_INTERNE',
    'CONTROLE_QUALITE',
    'REVUE_BUDGETAIRE',
    'REVUE_FINANCIERE',
    'OBSERVATION_BAILLEUR',
    'OBSERVATION_PARTENAIRE',
    'REVUE_GOUVERNANCE',
    'INSPECTION',
    'REVUE_DOCUMENTAIRE',
    'VERIFICATION_CONFORMITE',
    'AUTRE',
  ])
  source?: string;

  @IsOptional()
  @IsString()
  sourceReference?: string;

  @IsOptional()
  @IsString()
  sourceDocumentUrl?: string;

  @IsOptional()
  @IsString()
  actionPlanId?: string;

  @IsOptional()
  @IsString()
  activityId?: string;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;

  @IsOptional()
  @IsString()
  validatorId?: string;

  @IsOptional()
  @IsEnum(['CRITIQUE', 'ELEVEE', 'MOYENNE', 'FAIBLE'])
  priority?: string;

  @IsOptional()
  @IsEnum([
    'NON_DEMARREE',
    'EN_COURS',
    'PARTIELLEMENT_MISE_EN_OEUVRE',
    'REALISEE_A_VALIDER',
    'EN_RETARD',
    'SUSPENDUE',
    'VALIDEE',
    'ROUVERTE',
  ])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;
}
