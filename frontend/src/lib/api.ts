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

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
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
    return Promise.reject(err);
  },
);

export default api;

// Auth
export const authApi = {
  login: (email: string, password: string, totp?: string) =>
    api.post('/auth/login', { email, password, totp }),
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
    const entries = (res.data as any[]) ?? [];
    return {
      ...res,
      data: {
        byResponsible: entries
          .filter(e => e.responsible)
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
  list: () => api.get('/action-plans'),
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
  getPending: () => api.get('/validations/pending'),
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
  get: (id: string) => api.get(`/organizations/${id}`),
  create: (data: { name: string; logoUrl?: string; subscriptionPlan?: string; adminFirstName: string; adminLastName: string; adminEmail: string }) =>
    api.post('/organizations', data),
  update: (id: string, data: { name?: string; logoUrl?: string; subscriptionPlan?: string }) =>
    api.patch(`/organizations/${id}`, data),
  remove: (id: string) => api.delete(`/organizations/${id}`),
};

// Users (super admin scope — by org)
export const usersApi = {
  listAll: () => api.get('/users'),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
  toggleActive: (id: string, isActive: boolean) => api.patch(`/users/${id}`, { isActive }),
};
