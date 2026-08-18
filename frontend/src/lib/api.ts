import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Messages d'erreur conviviaux
const ERROR_MESSAGES: Record<number, string> = {
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

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Gestion du 401 (token expiré)
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'}/auth/refresh`,
            { refreshToken },
          );
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/auth/login';
        }
      }
    }

    // Transformer les erreurs techniques en messages conviviaux
    if (err.response?.status) {
      const status = err.response.status;
      const backendMessage = err.response.data?.message;

      // Si le backend renvoie un message clair, on l'utilise
      // Sinon on utilise notre message convivial par défaut
      if (backendMessage && typeof backendMessage === 'string') {
        err.message = backendMessage;
      } else if (ERROR_MESSAGES[status]) {
        err.message = ERROR_MESSAGES[status];
      }
    } else if (!err.response) {
      // Erreur réseau (pas de réponse du serveur)
      err.message = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
    }

    return Promise.reject(err);
  },
);

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
};

// Dashboard
export const dashboardApi = {
  getOverview: async () => {
    const res = await api.get('/dashboards/overview');
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
  getPerformance: async () => {
    const res = await api.get('/dashboards/performance');
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
  get: (id: string) => api.get(`/organizations/${id}`),
  create: (data: { name: string; logoUrl?: string; subscriptionPlan?: string; adminFirstName: string; adminLastName: string; adminEmail: string }) =>
    api.post('/organizations', data),
  update: (id: string, data: { name?: string; logoUrl?: string; subscriptionPlan?: string }) =>
    api.patch(`/organizations/${id}`, data),
  approve: (id: string) => api.patch(`/organizations/${id}/approve`),
  reject: (id: string, reason?: string) => api.patch(`/organizations/${id}/reject`, { reason }),
  remove: (id: string) => api.delete(`/organizations/${id}`),
};

// Users (super admin scope — by org)
export const usersApi = {
  listAll: () => api.get('/users'),
  listForAssignment: () => api.get('/users/list-for-assignment'),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
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
