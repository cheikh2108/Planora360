import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

/** Même règle que celle affichée sur la page de changement de mot de passe. */
export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export class ChangePasswordDto {
  @IsString()
  @MaxLength(128)
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(128)
  @Matches(PASSWORD_RULE, {
    message: 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre',
  })
  newPassword: string;
}
