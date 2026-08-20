/**
 * Token Storage Utilities
 */

import { TOKEN_KEYS } from './api-constants';

export const TokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.ACCESS);
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
  },

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },

  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  },
};
