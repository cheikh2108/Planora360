import { IsString, IsNotEmpty } from 'class-validator';

export class ImportParticipantsDto {
  @IsString()
  @IsNotEmpty()
  activityId: string;
}
