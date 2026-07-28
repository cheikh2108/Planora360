import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ValidationStep, ValidationDecision } from '@prisma/client';

export class TransitionDto {
  @IsEnum(ValidationStep)
  toStep: ValidationStep;

  @IsEnum(ValidationDecision)
  decision: ValidationDecision;

  @IsOptional()
  @IsString()
  comment?: string;
}
