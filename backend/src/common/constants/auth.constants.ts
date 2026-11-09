/**
 * Authentication & Security Constants
 */

export const BCRYPT_SALT_ROUNDS = 12;
export const MIN_PASSWORD_LENGTH = 8;
export const TOTP_VERIFICATION_WINDOW = 1;
export const TRIAL_PERIOD_DAYS = 30;
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
export const DEFAULT_BRAND_COLOR = '#2563eb';
export const TOTP_SECRET_LENGTH = 20;
export const REFRESH_TOKEN_BYTES = 40;
export const TOTP_ISSUER = 'PLANORA 360';

export const TRIAL_PERIOD_MS = TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export const ROLE_ADMIN = 'Administrateur';
export const ROLE_SUPER_ADMIN = 'Super administrateur';

export const ORG_STATUS_PENDING = 'PENDING';
export const ORG_STATUS_REJECTED = 'REJECTED';
export const ORG_STATUS_ACTIVE = 'ACTIVE';

export const ERROR_INVALID_CREDENTIALS = 'Identifiants invalides';
export const ERROR_REGISTRATION_PENDING = 'REGISTRATION_PENDING';
export const ERROR_REGISTRATION_REJECTED = 'REGISTRATION_REJECTED';
export const ERROR_ORGANIZATION_SUSPENDED = 'ORGANIZATION_SUSPENDED';
export const ERROR_INVALID_2FA_CODE = 'Code 2FA invalide';
export const ERROR_2FA_NOT_INITIALIZED = '2FA non initialisé';
export const ERROR_INVALID_CODE = 'Code invalide';
export const ERROR_INVALID_REFRESH_TOKEN = 'Refresh token invalide ou expiré';

export function calculateTrialEndDate(): Date {
  return new Date(Date.now() + TRIAL_PERIOD_MS);
}

export function calculateRefreshTokenExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return expiresAt;
}
