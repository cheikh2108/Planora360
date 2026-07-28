export type SubscriptionPlan = 'ESSENTIELLE' | 'PROFESSIONNELLE' | 'ORGANISATION' | 'SUR_MESURE';

export type ActivityStatus =
  | 'NON_DEMARREE'
  | 'EN_PREPARATION'
  | 'EN_COURS'
  | 'EN_ATTENTE'
  | 'SUSPENDUE'
  | 'TERMINEE'
  | 'VALIDEE'
  | 'EN_RETARD'
  | 'ANNULEE';

export type ValidationStep =
  | 'SOUMISSION'
  | 'VERIFICATION_HIERARCHIQUE'
  | 'VALIDATION_TECHNIQUE'
  | 'VALIDATION_ADMINISTRATIVE'
  | 'CLOTURE';

export type ValidationDecision = 'APPROUVE' | 'REJETE' | 'EN_ATTENTE';

export type Priority = 'BASSE' | 'NORMALE' | 'HAUTE' | 'CRITIQUE';

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
  updatedAt?: string;
  _count?: { users: number; actionPlans: number };
}

export interface Role {
  id: string;
  organizationId: string | null;
  name: string;
  permissions: string[];
  _count?: { users: number };
}

export const ALL_PERMISSIONS: { key: string; label: string; group: string }[] = [
  // Plans d'action
  { key: 'plan.read',   label: 'Consulter les plans',       group: 'Plans d\'action' },
  { key: 'plan.create', label: 'Créer un plan',             group: 'Plans d\'action' },
  { key: 'plan.update', label: 'Modifier un plan',          group: 'Plans d\'action' },
  { key: 'plan.delete', label: 'Supprimer un plan',         group: 'Plans d\'action' },
  // Activités
  { key: 'activity.read',   label: 'Consulter les activités',  group: 'Activités' },
  { key: 'activity.create', label: 'Créer une activité',        group: 'Activités' },
  { key: 'activity.update', label: 'Modifier une activité',     group: 'Activités' },
  { key: 'activity.delete', label: 'Supprimer une activité',    group: 'Activités' },
  // Check-list
  { key: 'checklist.create', label: 'Créer des tâches',     group: 'Check-list' },
  { key: 'checklist.update', label: 'Mettre à jour les tâches', group: 'Check-list' },
  { key: 'checklist.delete', label: 'Supprimer des tâches', group: 'Check-list' },
  // Validation
  { key: 'validation.submit',  label: 'Soumettre pour validation', group: 'Validation' },
  { key: 'validation.approve', label: 'Approuver',                  group: 'Validation' },
  { key: 'validation.reject',  label: 'Rejeter',                    group: 'Validation' },
  // Budget
  { key: 'budget.read', label: 'Consulter le budget',  group: 'Budget' },
  { key: 'budget.edit', label: 'Saisir le budget',     group: 'Budget' },
  // Documents
  { key: 'document.upload',   label: 'Téléverser des documents',    group: 'Documents' },
  { key: 'document.download', label: 'Télécharger des documents',   group: 'Documents' },
  // Rapports & dashboard
  { key: 'report.generate', label: 'Générer des rapports',    group: 'Rapports' },
  { key: 'dashboard.view',  label: 'Accéder au tableau de bord', group: 'Rapports' },
  // Utilisateurs
  { key: 'user.read',   label: 'Consulter les utilisateurs', group: 'Administration' },
  { key: 'user.create', label: 'Créer des utilisateurs',     group: 'Administration' },
  { key: 'user.update', label: 'Modifier des utilisateurs',  group: 'Administration' },
  { key: 'user.delete', label: 'Supprimer des utilisateurs', group: 'Administration' },
];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string;
  organization?: Organization;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ActionPlan {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  strategicGoals?: string;
  expectedResults?: string;
  budgetPrevisional?: number;
  organizationId: string;
  axes: Axis[];
  createdAt: string;
}

export interface Axis {
  id: string;
  title: string;
  actionPlanId: string;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  status: ActivityStatus;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  completionRate: number;
  budgetPlanned?: number;
  budgetExecuted?: number;
  organizationId: string;
  axisId: string;
  parentActivityId?: string;
  responsible?: { id: string; firstName: string; lastName: string };
  axis?: { title: string; actionPlan?: { title: string } };
  budgets?: Budget[];
  _count?: { checklistItems: number };
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  isMandatory: boolean;
  progress: number;
  isValidated: boolean;
  dueDate?: string;
  observations?: string;
  responsible?: { firstName: string; lastName: string };
}

export interface Validation {
  id: string;
  activityId: string;
  step: ValidationStep;
  decision: ValidationDecision;
  comment?: string;
  validatorId: string;
  validator?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface Budget {
  id: string;
  activityId: string;
  planned: number;
  committed: number;
  disbursed: number;
  executed: number;
  fundingSource?: string;
}

export interface DashboardOverview {
  totalActivities: number;
  byStatus: Partial<Record<ActivityStatus, number>>;
  completionRate: number;
  budgetPlanned: number;
  budgetExecuted: number;
  executionRate: number;
  pendingValidations: number;
  overdueActivities: number;
  upcomingDeadlines: Activity[];
  recentAudit: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  user?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
