/**
 * API Configuration Constants
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
} as const;

export const ERROR_MESSAGES: Record<number, string> = {
  400: 'Les informations fournies sont incorrectes. Veuillez vérifier et réessayer.',
  401: 'Votre session a expiré. Veuillez vous reconnecter.',
  403: 'Vous n\'avez pas les autorisations nécessaires pour effectuer cette action.',
  404: 'La ressource demandée est introuvable.',
  409: 'Cette action ne peut pas être effectuée car elle entre en conflit avec des données existantes.',
  422: 'Les données fournies ne sont pas valides.',
  429: 'Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.',
  500: 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.',
  502: 'Le serveur est temporairement indisponible. Veuillez réessayer dans quelques instants.',
  503: 'Le service est temporairement indisponible. Veuillez réessayer plus tard.',
};

export const NETWORK_ERROR_MESSAGE = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
export const LOGIN_REDIRECT_URL = '/auth/login';
