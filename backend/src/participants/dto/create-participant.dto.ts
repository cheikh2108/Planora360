import { IsString, IsNumber, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParticipantDto {
  @IsString()
  @IsNotEmpty()
  activityId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(['WAVE', 'ORANGE_MONEY'])
  @IsNotEmpty()
  paymentMode: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  amount?: number;
}
