import axios from 'axios';
import {
  API_BASE_URL,
  ERROR_MESSAGES,
  NETWORK_ERROR_MESSAGE,
  LOGIN_REDIRECT_URL,
} from './api-constants';
import { TokenStorage } from './token-storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // CRITICAL: Envoie les cookies httpOnly avec chaque requête
});

/**
 * Récupère le token CSRF depuis les cookies
 */
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
}

api.interceptors.request.use((config) => {
  // Ajouter token CSRF pour les requêtes mutantes (protection CSRF)
  const method = config.method?.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '')) {
    const csrfToken = getCsrfToken();
    console.log('[API Interceptor] CSRF Token:', {
      method,
      url: config.url,
      csrfToken: csrfToken ? `${csrfToken.substring(0, 20)}...` : 'MISSING',
      allCookies: typeof document !== 'undefined' ? document.cookie : 'SSR'
    });
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    } else {
      console.warn('[API Interceptor] No CSRF token found for mutating request!');
    }
  }

  // Rétrocompatibilité: fallback sur localStorage si cookies pas encore disponibles
  const token = TokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      return handleUnauthorizedError(err);
    }

    transformErrorMessage(err);
    return Promise.reject(err);
  },
);

async function handleUnauthorizedError(err: any) {
  const original = err.config;

  if (original._retry) {
    return Promise.reject(err);
  }

  original._retry = true;

  // Vérifier si on a un refresh token (cookie ou localStorage)
  const hasRefreshToken = hasCookie('refreshToken') || TokenStorage.hasRefreshToken();
  if (!hasRefreshToken) {
    redirectToLogin();
    return Promise.reject(err);
  }

  try {
    await refreshAccessToken();
    // Plus besoin de modifier Authorization header - le cookie est automatiquement envoyé
    return api(original);
  } catch {
    redirectToLogin();
    return Promise.reject(err);
  }
}

/**
 * Vérifie si un cookie existe
 */
function hasCookie(name: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(`${name}=`);
}

async function refreshAccessToken(): Promise<void> {
  // Le refresh token est automatiquement envoyé via le cookie httpOnly
  // Backend retourne les nouveaux tokens dans des cookies
  const refreshToken = TokenStorage.getRefreshToken(); // Fallback localStorage
  await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    refreshToken ? { refreshToken } : {}, // Body vide si cookie présent
    { withCredentials: true }
  );
  // Les nouveaux cookies sont automatiquement définis par le navigateur
}

function redirectToLogin() {
  TokenStorage.clearTokens();
  if (typeof window !== 'undefined') {
    window.location.href = LOGIN_REDIRECT_URL;
  }
}

function transformErrorMessage(err: any) {
  if (err.response?.status) {
    const status = err.response.status;
    const backendMessage = err.response.data?.message;

    if (backendMessage && typeof backendMessage === 'string') {
      err.message = backendMessage;
    } else if (ERROR_MESSAGES[status]) {
      err.message = ERROR_MESSAGES[status];
    }
  } else if (!err.response) {
    err.message = NETWORK_ERROR_MESSAGE;
  }
}

export default api;

// Auth
export const authApi = {
  login: (email: string, password: string, totp?: string) =>
    api.post('/auth/login', { email, password, totp }),
  register: (data: {
    organizationName: string;
    subscriptionPlan?: string;
    brandColor?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  setup2fa: () => api.post('/auth/2fa/setup'),
  enable2fa: (token: string) => api.post('/auth/2fa/enable', { token }),
  disable2fa: (token: string) => api.post('/auth/2fa/disable', { token }),
  changePassword: (newPassword: string) => api.patch('/auth/change-password', { newPassword }),
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
  getValidations: (id: string) => api.get(`/passation/demandes/${id}/validations`),
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
  attribuer: (id: string, data: { soumissionId: string }) =>
    api.post(`/passation/procedures/${id}/attribuer`, data),
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
  changeStatus: (id: string, status: string, motif?: string) =>
    api.post(`/passation/contrats/${id}/status`, { status, motif }),
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
  addParticipant: (id: string, data: { userId: string; role?: string }) =>
    api.post(`/messagerie/conversations/${id}/participants`, data),
  removeParticipant: (id: string, userId: string) =>
    api.delete(`/messagerie/conversations/${id}/participants/${userId}`),
  archive: (id: string) => api.post(`/messagerie/conversations/${id}/archive`),
  unarchive: (id: string) => api.post(`/messagerie/conversations/${id}/unarchive`),
  delete: (id: string) => api.delete(`/messagerie/conversations/${id}`),
};

// Messages (REST API pour historique, WebSocket pour temps réel)
export const messagesApi = {
  getAll: (conversationId: string, params?: { limit?: number; before?: string }) =>
    api.get(`/messagerie/conversations/${conversationId}/messages`, { params }),
  send: (conversationId: string, data: {
    content: string;
    contentType?: string;
    parentId?: string;
    mentionedUserIds?: string[];
  }) => api.post(`/messagerie/conversations/${conversationId}/messages`, data),
  edit: (conversationId: string, messageId: string, content: string) =>
    api.patch(`/messagerie/conversations/${conversationId}/messages/${messageId}`, { content }),
  remove: (conversationId: string, messageId: string) =>
    api.delete(`/messagerie/conversations/${conversationId}/messages/${messageId}`),
  markAsRead: (conversationId: string, messageId: string) =>
    api.post(`/messagerie/conversations/${conversationId}/messages/${messageId}/read`),
  addReaction: (conversationId: string, messageId: string, emoji: string) =>
    api.post(`/messagerie/conversations/${conversationId}/messages/${messageId}/reactions`, {
      emoji,
    }),
  removeReaction: (conversationId: string, messageId: string, reactionId: string) =>
    api.delete(
      `/messagerie/conversations/${conversationId}/messages/${messageId}/reactions/${reactionId}`,
    ),
};
