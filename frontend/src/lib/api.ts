import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  API_BASE_URL,
  ERROR_MESSAGES,
  ERROR_CODE_MESSAGES,
  NETWORK_ERROR_MESSAGE,
  LOGIN_REDIRECT_URL,
} from './api-constants';

/**
 * Client HTTP de l'application.
 *
 * Authentification : jetons dans des cookies httpOnly posés par le backend (jamais lisibles ni
 * stockés côté client). Les requêtes mutantes portent l'en-tête X-CSRF-Token (double-submit).
 * Sur un 401, une seule demande de rafraîchissement est faite pour toutes les requêtes en attente,
 * puis elles sont rejouées ; si le rafraîchissement échoue, retour à la page de connexion.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/** Routes d'authentification : un 401 y est une réponse métier, pas une session expirée. */
const AUTH_ROUTES = /\/auth\/(login|register|refresh|logout|request-quote|forgot-password|reset-password)\b/;

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase() ?? 'GET';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as RetriableConfig | undefined;
    const isAuthRoute = AUTH_ROUTES.test(original?.url ?? '');

    if (err.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        redirectToLogin();
      }
    }

    transformErrorMessage(err as AxiosError<{ message?: string | string[] }>);
    return Promise.reject(err);
  },
);

/** Rafraîchissement partagé : plusieurs 401 simultanés ne déclenchent qu'un seul appel. */
let refreshing: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  if (!refreshing) {
    refreshing = axios
      .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('user');
  } catch {
    /* stockage indisponible */
  }
  if (!window.location.pathname.startsWith(LOGIN_REDIRECT_URL)) {
    window.location.href = LOGIN_REDIRECT_URL;
  }
}

/** Remplace le message technique par un message lisible (français) dans err.message. */
function transformErrorMessage(err: AxiosError<{ message?: string | string[] }>) {
  if (!err.response) {
    err.message = NETWORK_ERROR_MESSAGE;
    return;
  }
  const status: number = err.response.status;
  const raw = err.response.data?.message;
  const backendMessage = Array.isArray(raw) ? raw.join(' ') : raw;

  if (status === 429) {
    // Le message du limiteur est en anglais (« ThrottlerException: Too Many Requests »)
    err.message = ERROR_MESSAGES[429];
  } else if (typeof backendMessage === 'string' && ERROR_CODE_MESSAGES[backendMessage]) {
    err.message = ERROR_CODE_MESSAGES[backendMessage];
  } else if (typeof backendMessage === 'string' && backendMessage.trim() && status < 500) {
    err.message = backendMessage;
  } else if (ERROR_MESSAGES[status]) {
    err.message = ERROR_MESSAGES[status];
  }
}

/** Message d'erreur affichable à partir de n'importe quelle erreur (axios ou autre). */
export function getErrorMessage(err: unknown, fallback = 'Une erreur est survenue.'): string {
  const message = err instanceof Error ? err.message : (err as { message?: unknown } | null)?.message;
  if (typeof message === 'string' && message && !/^Request failed with status code/.test(message)) {
    return message;
  }
  return fallback;
}

/** Code d'erreur brut renvoyé par le backend (ex. REGISTRATION_PENDING), s'il y en a un. */
export function getErrorCode(err: unknown): string | undefined {
  const raw = (err as AxiosError<{ message?: unknown }> | null)?.response?.data?.message;
  return typeof raw === 'string' ? raw : undefined;
}

export default api;

// Auth
export const authApi = {
  login: (email: string, password: string, totp?: string) =>
    api.post('/auth/login', { email, password, totp }),
  register: (data: {
    organizationName: string;
    subscriptionPlan?: string;
    billingCycle?: 'MONTHLY' | 'YEARLY';
    brandColor?: string;
    firstName: string;
    lastName: string;
    email: string;
  }) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  setup2fa: () => api.post('/auth/2fa/setup'),
  enable2fa: (token: string) => api.post('/auth/2fa/enable', { token }),
  disable2fa: (token: string) => api.post('/auth/2fa/disable', { token }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/auth/change-password', { currentPassword, newPassword }),
  getWebSocketToken: () => api.get('/auth/ws-token'), // Token temporaire sécurisé pour WebSocket
};

// Dashboard
export const dashboardApi = {
  getOverview: async (params?: Record<string, string>) => {
    const res = await api.get('/dashboards/overview', { params });
    const d = res.data;
    return {
      ...res,
      data: {
        totalActivities: d.activities?.total ?? 0,
        byStatus: d.activities?.byStatus ?? {},
        completionRate: d.activities?.avgCompletionRate ?? 0,
        pendingValidations: 0,
        overdueActivities: d.activities?.overdue ?? 0,
        budgetPlanned: d.budget?.planned ?? 0,
        budgetExecuted: d.budget?.executed ?? 0,
        executionRate: d.budget?.executionRate ?? 0,
        upcomingDeadlines: d.upcomingDeadlines ?? [],
        recentAudit: d.recentActivity ?? [],
      },
    };
  },
  getPerformance: async (params?: Record<string, string>) => {
    const res = await api.get('/dashboards/performance', { params });
    // Backend peut retourner soit un tableau, soit un objet avec byResponsible
    const rawData = res.data;
    let entries: any[] = [];

    if (Array.isArray(rawData)) {
      entries = rawData;
    } else if (rawData && typeof rawData === 'object') {
      // Si c'est un objet, chercher byResponsible ou toute propriété qui est un tableau
      entries = (rawData as any).byResponsible ?? Object.values(rawData).find(Array.isArray) ?? [];
    }

    return {
      ...res,
      data: {
        byResponsible: entries
          .filter(e => e && e.responsible)
          .map(e => ({
            userId: e.responsible?.email ?? '',
            name: `${e.responsible?.firstName ?? ''} ${e.responsible?.lastName ?? ''}`.trim(),
            total: e.total ?? 0,
            completed: e.completed ?? 0,
            overdue: e.overdue ?? 0,
            avgCompletionRate: e.avgCompletion ?? 0,
          })),
      },
    };
  },
  getPlanProgress: (planId: string) => api.get(`/dashboards/plan/${planId}/progress`),
};

// Action Plans
export const plansApi = {
  list: (params?: Record<string, unknown>) => api.get('/action-plans', { params }),
  get: (id: string) => api.get(`/action-plans/${id}`),
  create: (data: Record<string, unknown>) => api.post('/action-plans', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/action-plans/${id}`, data),
  delete: (id: string) => api.delete(`/action-plans/${id}`),
};

// Activities
export const activitiesApi = {
  list: (params?: Record<string, unknown>) => api.get('/activities', { params }),
  get: (id: string) => api.get(`/activities/${id}`),
  create: (data: Record<string, unknown>) => api.post('/activities', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/activities/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/activities/${id}/status`, { status }),
  import: (file: File, planId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('planId', planId);
    return api.post('/activities/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Checklist
export const checklistApi = {
  list: (activityId: string) => api.get(`/activities/${activityId}/checklist`),
  create: (activityId: string, data: Record<string, unknown>) =>
    api.post(`/activities/${activityId}/checklist`, data),
  update: (activityId: string, itemId: string, data: Record<string, unknown>) =>
    api.patch(`/activities/${activityId}/checklist/${itemId}`, data),
  delete: (activityId: string, itemId: string) =>
    api.delete(`/activities/${activityId}/checklist/${itemId}`),
};

// Validations
export const validationsApi = {
  getPending: (params?: Record<string, unknown>) => api.get('/validations/pending', { params }),
  getCurrent: (activityId: string) => api.get(`/activities/${activityId}/validations/current`),
  submit: (activityId: string) => api.post(`/activities/${activityId}/submit`),
  transition: (activityId: string, data: Record<string, unknown>) =>
    api.post(`/activities/${activityId}/validate`, data),
};

// Budgets
export const budgetsApi = {
  list: (activityId: string) => api.get(`/activities/${activityId}/budgets`),
  summary: () => api.get('/budgets/summary'),
  summaryByPlan: (planId: string) => api.get(`/budgets/summary/plan/${planId}`),
  create: (activityId: string, data: Record<string, unknown>) =>
    api.post(`/activities/${activityId}/budgets`, data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/budgets/${id}`, data),
};

// Reports
export const reportsApi = {
  generate: (data: Record<string, unknown>) => api.post('/reports/generate', data, { responseType: 'blob' }),
};

// Indicators
export const indicatorsApi = {
  list: (params?: Record<string, unknown>) => api.get('/indicators', { params }),
  get: (id: string) => api.get(`/indicators/${id}`),
  create: (data: Record<string, unknown>) => api.post('/indicators', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/indicators/${id}`, data),
  remove: (id: string) => api.delete(`/indicators/${id}`),
};

// Audit
export const auditApi = {
  list: (params?: Record<string, unknown>) => api.get('/audit', { params }),
};

// Roles
export const rolesApi = {
  list: () => api.get('/roles'),
  get: (id: string) => api.get(`/roles/${id}`),
  create: (data: { name: string; permissions: string[] }) => api.post('/roles', data),
  update: (id: string, data: { name?: string; permissions?: string[] }) => api.patch(`/roles/${id}`, data),
  remove: (id: string) => api.delete(`/roles/${id}`),
};

// Organizations (super admin)
export const organizationsApi = {
  list: () => api.get('/organizations'),
  listPending: () => api.get('/organizations/pending'),
  getDeleted: () => api.get('/organizations/deleted'),
  get: (id: string) => api.get(`/organizations/${id}`),
  create: (data: { name: string; logoUrl?: string; subscriptionPlan?: string; adminFirstName: string; adminLastName: string; adminEmail: string }) =>
    api.post('/organizations', data),
  update: (id: string, data: { name?: string; logoUrl?: string; subscriptionPlan?: string }) =>
    api.patch(`/organizations/${id}`, data),
  approve: (id: string) => api.patch(`/organizations/${id}/approve`),
  reject: (id: string, reason?: string) => api.patch(`/organizations/${id}/reject`, { reason }),
  remove: (id: string) => api.delete(`/organizations/${id}`),
  restore: (id: string) => api.patch(`/organizations/${id}/restore`),
  hardDelete: (id: string) => api.delete(`/organizations/${id}/hard`),
};

// Users (super admin scope — by org)
export const usersApi = {
  listAll: () => api.get('/users'),
  listForAssignment: () => api.get('/users/list-for-assignment'),
  getDeleted: () => api.get('/users/deleted'),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
  restore: (id: string) => api.post(`/users/${id}/restore`),
  hardDelete: (id: string) => api.delete(`/users/${id}/hard`),
  toggleActive: (id: string, isActive: boolean) => api.patch(`/users/${id}`, { isActive }),
};

// Recommendations
export const recommendationsApi = {
  getAll: (filters?: Record<string, unknown>) => api.get('/recommendations', { params: filters }),
  get: (id: string) => api.get(`/recommendations/${id}`),
  getStats: () => api.get('/recommendations/stats'),
  create: (data: Record<string, unknown>) => api.post('/recommendations', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/recommendations/${id}`, data),
  changeStatus: (id: string, status: string, comment?: string) =>
    api.patch(`/recommendations/${id}/status`, { status, comment }),
  suspend: (id: string, reason: string) => api.post(`/recommendations/${id}/suspend`, { reason }),
  reopen: (id: string, reason: string) => api.post(`/recommendations/${id}/reopen`, { reason }),
  remove: (id: string) => api.delete(`/recommendations/${id}`),
  addAction: (id: string, data: Record<string, unknown>) =>
    api.post(`/recommendations/${id}/actions`, data),
  updateAction: (actionId: string, data: Record<string, unknown>) =>
    api.patch(`/recommendations/actions/${actionId}`, data),
  removeAction: (actionId: string) => api.delete(`/recommendations/actions/${actionId}`),
  addComment: (id: string, content: string, isImportant?: boolean) =>
    api.post(`/recommendations/${id}/comments`, { content, isImportant }),
  getComments: (id: string) => api.get(`/recommendations/${id}/comments`),
};

// Maintenance
export const maintenanceApi = {
  getStatus: () => api.get('/maintenance/status'),
  toggle: (data: { maintenanceMode: boolean; maintenanceMessage?: string }) =>
    api.put('/maintenance', data),
};

// ============================================================================
// PASSATION DE MARCHÉS
// ============================================================================

// PPM (Plan Passation des Marchés)
export const ppmApi = {
  getAll: (filters?: { year?: number; status?: string; projectId?: string }) =>
    api.get('/passation/ppm', { params: filters }),
  getOne: (id: string) => api.get(`/passation/ppm/${id}`),
  create: (data: any) => api.post('/passation/ppm', data),
  update: (id: string, data: any) => api.patch(`/passation/ppm/${id}`, data),
  remove: (id: string) => api.delete(`/passation/ppm/${id}`),
  validate: (id: string) => api.post(`/passation/ppm/${id}/validate`),
  updateStatus: (id: string, status: string) => api.patch(`/passation/ppm/${id}/status`, { status }),
  addLigne: (id: string, data: any) => api.post(`/passation/ppm/${id}/lignes`, data),
  export: (id: string, format: 'pdf' | 'excel') =>
    api.get(`/passation/ppm/${id}/export`, { params: { format } }),
};

// Demandes d'achat
export const demandesApi = {
  getAll: (filters?: { status?: string }) =>
    api.get('/passation/demandes', { params: filters }),
  getOne: (id: string) => api.get(`/passation/demandes/${id}`),
  create: (data: any) => api.post('/passation/demandes', data),
  update: (id: string, data: any) => api.patch(`/passation/demandes/${id}`, data),
  remove: (id: string) => api.delete(`/passation/demandes/${id}`),
  submit: (id: string) => api.post(`/passation/demandes/${id}/submit`),
  validate: (id: string, data: { decision: 'APPROUVE' | 'REJETE'; commentaire?: string }) =>
    api.post(`/passation/demandes/${id}/validate`, data),
  getWorkflow: (id: string) => api.get(`/passation/demandes/${id}/workflow`),
};

// Fournisseurs
export const fournisseursApi = {
  getAll: (filters?: { status?: string; search?: string }) =>
    api.get('/passation/fournisseurs', { params: filters }),
  getOne: (id: string) => api.get(`/passation/fournisseurs/${id}`),
  create: (data: any) => api.post('/passation/fournisseurs', data),
  update: (id: string, data: any) => api.patch(`/passation/fournisseurs/${id}`, data),
  remove: (id: string) => api.delete(`/passation/fournisseurs/${id}`),
  suspend: (id: string, motif?: string) =>
    api.post(`/passation/fournisseurs/${id}/suspend`, { motif }),
  blacklist: (id: string, motif: string) =>
    api.post(`/passation/fournisseurs/${id}/blacklist`, { motif }),
  activate: (id: string) => api.post(`/passation/fournisseurs/${id}/activate`),
  addDocument: (id: string, data: any) =>
    api.post(`/passation/fournisseurs/${id}/documents`, data),
  removeDocument: (id: string, docId: string) =>
    api.delete(`/passation/fournisseurs/${id}/documents/${docId}`),
};

// Procédures
export const proceduresApi = {
  getAll: (filters?: { status?: string; methode?: string }) =>
    api.get('/passation/procedures', { params: filters }),
  getOne: (id: string) => api.get(`/passation/procedures/${id}`),
  create: (data: any) => api.post('/passation/procedures', data),
  update: (id: string, data: any) => api.patch(`/passation/procedures/${id}`, data),
  remove: (id: string) => api.delete(`/passation/procedures/${id}`),
  publish: (id: string) => api.post(`/passation/procedures/${id}/publish`),
  close: (id: string) => api.post(`/passation/procedures/${id}/close`),
  cancel: (id: string, motif: string) => api.post(`/passation/procedures/${id}/cancel`, { motif }),
};

// Soumissions
export const soumissionsApi = {
  getAll: (procedureId: string) =>
    api.get(`/passation/procedures/${procedureId}/soumissions`),
  getOne: (procedureId: string, id: string) =>
    api.get(`/passation/procedures/${procedureId}/soumissions/${id}`),
  create: (procedureId: string, data: any) =>
    api.post(`/passation/procedures/${procedureId}/soumissions`, data),
};

// Commissions
export const commissionsApi = {
  getAll: () => api.get('/passation/commissions'),
  getOne: (id: string) => api.get(`/passation/commissions/${id}`),
  create: (data: any) => api.post('/passation/commissions', data),
  addMember: (id: string, data: { userId: string; role: string }) =>
    api.post(`/passation/commissions/${id}/membres`, data),
  removeMember: (id: string, membreId: string) =>
    api.delete(`/passation/commissions/${id}/membres/${membreId}`),
};

// Évaluations
export const evaluationsApi = {
  getAll: (procedureId: string) =>
    api.get(`/passation/procedures/${procedureId}/evaluations`),
  create: (procedureId: string, data: any) =>
    api.post(`/passation/procedures/${procedureId}/evaluations`, data),
  getSynthese: (procedureId: string) =>
    api.get(`/passation/procedures/${procedureId}/evaluations/synthese`),
};

// Contrats
export const contratsApi = {
  getAll: (filters?: { status?: string; fournisseurId?: string }) =>
    api.get('/passation/contrats', { params: filters }),
  getOne: (id: string) => api.get(`/passation/contrats/${id}`),
  create: (data: any) => api.post('/passation/contrats', data),
  update: (id: string, data: any) => api.patch(`/passation/contrats/${id}`, data),
  suspend: (id: string, motif?: string) => api.post(`/passation/contrats/${id}/suspend`, { motif }),
  terminate: (id: string, motif?: string) => api.post(`/passation/contrats/${id}/terminate`, { motif }),
  close: (id: string) => api.post(`/passation/contrats/${id}/close`),
  getDashboard: (id: string) => api.get(`/passation/contrats/${id}/dashboard`),
};

// ============================================================================
// MESSAGERIE PROFESSIONNELLE
// ============================================================================

// Conversations
export const conversationsApi = {
  getAll: () => api.get('/messagerie/conversations'),
  getOne: (id: string) => api.get(`/messagerie/conversations/${id}`),
  create: (data: {
    titre?: string;
    type: string;
    contextId?: string;
    participantIds: string[];
  }) => api.post('/messagerie/conversations', data),
  archive: (id: string) => api.post(`/messagerie/conversations/${id}/archive`),
  unarchive: (id: string) => api.post(`/messagerie/conversations/${id}/unarchive`),
  delete: (id: string) => api.delete(`/messagerie/conversations/${id}`),
};

// Messages : historique et envoi en REST ; modification, suppression, réactions et accusés de
// lecture passent par le WebSocket (voir useMessagerie).
export const messagesApi = {
  getAll: (conversationId: string, params?: { limit?: number; before?: string }) =>
    api.get(`/messagerie/conversations/${conversationId}/messages`, { params }),
  send: (conversationId: string, data: {
    content: string;
    contentType?: string;
    parentId?: string;
    mentionedUserIds?: string[];
  }) => api.post(`/messagerie/conversations/${conversationId}/messages`, data),
};

// ============================================================================
// ZONES GÉOGRAPHIQUES
// ============================================================================

export const zonesApi = {
  getAll: () => api.get('/zones'),
  getTree: () => api.get('/zones/tree'),
  getStats: () => api.get('/zones/stats'),
  getOne: (id: string) => api.get(`/zones/${id}`),
  create: (data: any) => api.post('/zones', data),
  update: (id: string, data: any) => api.patch(`/zones/${id}`, data),
  remove: (id: string) => api.delete(`/zones/${id}`),
  // Configuration des zones
  getConfig: () => api.get('/zones/config'),
  getPresets: () => api.get('/zones/config/presets'),
  createConfig: (data: any) => api.post('/zones/config', data),
  updateConfig: (data: any) => api.patch('/zones/config', data),
};
