import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class ChangeStatusDto {
  @IsEnum([
    'NON_DEMARREE',
    'EN_COURS',
    'PARTIELLEMENT_MISE_EN_OEUVRE',
    'REALISEE_A_VALIDER',
    'SUSPENDUE',
    'VALIDEE',
    'ROUVERTE',
  ])
  status!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class SuspendRecommendationDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class ReopenRecommendationDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class ValidateRecommendationDto {
  @IsOptional()
  @IsString()
  comment?: string;
}

export class RejectRecommendationDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
