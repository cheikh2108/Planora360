import { IsString, IsNumber, IsNotEmpty, IsEnum } from 'class-validator';

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
  @IsNotEmpty()
  amount: number;
}
