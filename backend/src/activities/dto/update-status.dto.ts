import { IsEnum } from 'class-validator';
import { ActivityStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(ActivityStatus)
  status: ActivityStatus;
}
