// Utilisé par RecommendationsController (PATCH /recommendations/actions/:actionId)
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export const ACTION_STATUSES = [
  'NON_DEMARREE',
  'EN_COURS',
  'TERMINEE',
  'ANNULEE',
];

export class UpdateActionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;

  @IsOptional()
  @IsIn(ACTION_STATUSES)
  status?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
