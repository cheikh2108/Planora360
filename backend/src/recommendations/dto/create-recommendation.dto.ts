import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsIn, MinLength } from 'class-validator';

export class CreateRecommendationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

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
  source!: string;

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

  @IsDateString()
  issuedAt!: string;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  issuerId?: string;

  @IsOptional()
  @IsString()
  issuerExternal?: string;

  @IsString()
  @IsNotEmpty()
  responsibleId!: string;

  @IsOptional()
  @IsString()
  validatorId?: string;

  @IsEnum(['CRITIQUE', 'ELEVEE', 'MOYENNE', 'FAIBLE'])
  priority!: string;
}
