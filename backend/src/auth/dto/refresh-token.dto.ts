import { IsOptional, IsString } from 'class-validator';

/** Le refresh token est lu en priorité dans le cookie httpOnly ; le corps reste accepté (anciens clients). */
export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
