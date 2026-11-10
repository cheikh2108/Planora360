import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_RULE } from './change-password.dto';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  @MaxLength(254)
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(20)
  @MaxLength(200)
  token: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(128)
  @Matches(PASSWORD_RULE, { message: 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre' })
  newPassword: string;
}

export class CheckResetTokenDto {
  @IsString()
  @MaxLength(200)
  token: string;
}
