import { IsString, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @IsNotEmpty()
  adminFirstName: string;

  @IsString()
  @IsNotEmpty()
  adminLastName: string;

  @IsEnum(['INDIVIDUEL', 'PRO', 'EQUIPE', 'ORGANISATION'])
  plan: 'INDIVIDUEL' | 'PRO' | 'EQUIPE' | 'ORGANISATION';
}
