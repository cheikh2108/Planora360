"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_INVALID_REFRESH_TOKEN = exports.ERROR_INVALID_CODE = exports.ERROR_2FA_NOT_INITIALIZED = exports.ERROR_INVALID_2FA_CODE = exports.ERROR_REGISTRATION_REJECTED = exports.ERROR_REGISTRATION_PENDING = exports.ERROR_INVALID_CREDENTIALS = exports.ORG_STATUS_ACTIVE = exports.ORG_STATUS_REJECTED = exports.ORG_STATUS_PENDING = exports.ROLE_SUPER_ADMIN = exports.ROLE_ADMIN = exports.TRIAL_PERIOD_MS = exports.TOTP_ISSUER = exports.REFRESH_TOKEN_BYTES = exports.TOTP_SECRET_LENGTH = exports.DEFAULT_BRAND_COLOR = exports.REFRESH_TOKEN_EXPIRY_DAYS = exports.TRIAL_PERIOD_DAYS = exports.TOTP_VERIFICATION_WINDOW = exports.MIN_PASSWORD_LENGTH = exports.BCRYPT_SALT_ROUNDS = void 0;
exports.calculateTrialEndDate = calculateTrialEndDate;
exports.calculateRefreshTokenExpiry = calculateRefreshTokenExpiry;
exports.BCRYPT_SALT_ROUNDS = 12;
exports.MIN_PASSWORD_LENGTH = 8;
exports.TOTP_VERIFICATION_WINDOW = 1;
exports.TRIAL_PERIOD_DAYS = 30;
exports.REFRESH_TOKEN_EXPIRY_DAYS = 7;
exports.DEFAULT_BRAND_COLOR = '#2563eb';
exports.TOTP_SECRET_LENGTH = 20;
exports.REFRESH_TOKEN_BYTES = 40;
exports.TOTP_ISSUER = 'PLANORA 360';
exports.TRIAL_PERIOD_MS = exports.TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;
exports.ROLE_ADMIN = 'Administrateur';
exports.ROLE_SUPER_ADMIN = 'Super administrateur';
exports.ORG_STATUS_PENDING = 'PENDING';
exports.ORG_STATUS_REJECTED = 'REJECTED';
exports.ORG_STATUS_ACTIVE = 'ACTIVE';
exports.ERROR_INVALID_CREDENTIALS = 'Identifiants invalides';
exports.ERROR_REGISTRATION_PENDING = 'REGISTRATION_PENDING';
exports.ERROR_REGISTRATION_REJECTED = 'REGISTRATION_REJECTED';
exports.ERROR_INVALID_2FA_CODE = 'Code 2FA invalide';
exports.ERROR_2FA_NOT_INITIALIZED = '2FA non initialisé';
exports.ERROR_INVALID_CODE = 'Code invalide';
exports.ERROR_INVALID_REFRESH_TOKEN = 'Refresh token invalide ou expiré';
function calculateTrialEndDate() {
    return new Date(Date.now() + exports.TRIAL_PERIOD_MS);
}
function calculateRefreshTokenExpiry() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + exports.REFRESH_TOKEN_EXPIRY_DAYS);
    return expiresAt;
}
//# sourceMappingURL=auth.constants.js.map