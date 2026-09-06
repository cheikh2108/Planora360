import { IsString, IsNotEmpty } from 'class-validator';

export class ImportActivitiesDto {
  @IsString()
  @IsNotEmpty()
  planId: string; // Plan d'action pour les activités importées
}
