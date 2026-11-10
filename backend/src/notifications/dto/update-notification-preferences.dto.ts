import { IsBoolean, IsOptional } from 'class-validator';

/** Mise à jour partielle des préférences d'e-mails (clés inconnues rejetées par le ValidationPipe). */
export class UpdateNotificationPreferencesDto {
  @IsOptional() @IsBoolean() validationRequests?: boolean;
  @IsOptional() @IsBoolean() validationResults?: boolean;
  @IsOptional() @IsBoolean() overdueActivities?: boolean;
  @IsOptional() @IsBoolean() upcomingDeadlines?: boolean;
}
