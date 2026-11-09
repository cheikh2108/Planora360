// Utilisé par EvaluationsController (POST /passation/procedures/:procedureId/evaluations)
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateEvaluationDto {
  @IsString()
  @IsNotEmpty()
  soumissionId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  scoreAdmin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  scoreTechnique?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  scoreFinancier?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  scoreGlobal?: number;

  @IsObject({ message: 'Les critères doivent être un objet' })
  criteres: Record<string, unknown>;

  @IsOptional()
  @IsString()
  commentaires?: string;
}
