/**
 * API Configuration Constants
 */

// En dev : URL relative pour utiliser le proxy Next.js (gère cookies cross-domain)
// En prod : URL absolue du backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

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

/** Codes d'erreur métier renvoyés par le backend, traduits pour l'utilisateur. */
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  REGISTRATION_PENDING: 'Votre inscription est en cours de validation. Vous recevrez un email dès que votre compte sera activé.',
  REGISTRATION_REJECTED: 'Votre demande d\'inscription a été refusée. Contactez le support pour plus d\'informations.',
  ORGANIZATION_SUSPENDED: 'L\'accès de votre organisation est suspendu. Contactez votre administrateur ou le support.',
  TOTP_REQUIRED: 'Entrez votre code d\'authentification à deux facteurs.',
  'Identifiants invalides': 'Email ou mot de passe incorrect.',
  'ThrottlerException: Too Many Requests': 'Trop de tentatives. Patientez une minute avant de réessayer.',
};

export const NETWORK_ERROR_MESSAGE = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
export const LOGIN_REDIRECT_URL = '/auth/login';
