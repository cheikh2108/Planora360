export type SubscriptionPlan = 'DECOUVERTE' | 'PROFESSIONNELLE' | 'SUR_MESURE';
export type OrganizationStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

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
  brandColor?: string;
  subscriptionPlan: SubscriptionPlan;
  status: OrganizationStatus;
  rejectionReason?: string;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  _count?: { users: number; actionPlans: number };
  users?: { email: string; firstName: string; lastName: string }[];
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
  mustChangePassword: boolean;
  twoFactorEnabled: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type PlanStatus = 'BROUILLON' | 'EN_COURS' | 'TERMINE' | 'ARCHIVE';

export interface ActionPlan {
  id: string;
  title: string;
  status: PlanStatus;
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
  expectedResults?: string;
  status: ActivityStatus;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  completionRate: number;
  budgetPlanned?: number;
  budgetExecuted?: number;
  risks?: string;
  organizationId: string;
  axisId: string;
  parentActivityId?: string;
  responsible?: { id: string; firstName: string; lastName: string };
  collaborators?: { id: string; user: { id: string; firstName: string; lastName: string; email: string } }[];
  axis?: { title: string; actionPlan?: { title: string } };
  budgets?: Budget[];
  _count?: { checklistItems: number };
  createdAt: string;
}

export interface Indicator {
  id: string;
  organizationId: string;
  activityId?: string;
  activity?: { id: string; title: string };
  title: string;
  unit?: string;
  baseline: number;
  target: number;
  achieved: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
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
  budgetCommitted: number;
  budgetExecuted: number;
  availableBalance: number;
  remainingToPay: number;
  commitmentRate: number;
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

// Recommendations
export type RecommendationSource =
  | 'MISSION_SUPERVISION'
  | 'VISITE_TERRAIN'
  | 'AUDIT_INTERNE'
  | 'AUDIT_EXTERNE'
  | 'EVALUATION_PROJET'
  | 'EVALUATION_PROGRAMME'
  | 'REUNION_COORDINATION'
  | 'REVUE_PERFORMANCE'
  | 'CONTROLE_INTERNE'
  | 'CONTROLE_QUALITE'
  | 'REVUE_BUDGETAIRE'
  | 'REVUE_FINANCIERE'
  | 'OBSERVATION_BAILLEUR'
  | 'OBSERVATION_PARTENAIRE'
  | 'REVUE_GOUVERNANCE'
  | 'INSPECTION'
  | 'REVUE_DOCUMENTAIRE'
  | 'VERIFICATION_CONFORMITE'
  | 'AUTRE';

export type RecommendationPriority = 'CRITIQUE' | 'ELEVEE' | 'MOYENNE' | 'FAIBLE';

export type RecommendationStatus =
  | 'NON_DEMARREE'
  | 'EN_COURS'
  | 'PARTIELLEMENT_MISE_EN_OEUVRE'
  | 'REALISEE_A_VALIDER'
  | 'EN_RETARD'
  | 'SUSPENDUE'
  | 'VALIDEE'
  | 'ROUVERTE';

export interface Recommendation {
  id: string;
  code: string;
  title: string;
  description: string;
  source: RecommendationSource;
  sourceReference?: string;
  sourceDocumentUrl?: string;
  actionPlanId?: string;
  actionPlan?: { id: string; title: string };
  activityId?: string;
  activity?: { id: string; title: string };
  organizationId: string;
  issuedAt: string;
  dueDate: string;
  completedAt?: string;
  validatedAt?: string;
  issuerId?: string;
  issuer?: { id: string; firstName: string; lastName: string; email: string };
  issuerExternal?: string;
  responsibleId: string;
  responsible: { id: string; firstName: string; lastName: string; email: string };
  validatorId?: string;
  validator?: { id: string; firstName: string; lastName: string; email: string };
  createdById: string;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
  contributors?: RecommendationContributor[];
  priority: RecommendationPriority;
  status: RecommendationStatus;
  progress: number;
  suspendedReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  reopenedReason?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  isRecurrent: boolean;
  recurrenceNote?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    actions: number;
    evidences: number;
    comments: number;
    history: number;
  };
  actions?: RecommendationAction[];
  evidences?: RecommendationEvidence[];
  comments?: RecommendationComment[];
  history?: RecommendationHistory[];
}

export interface RecommendationContributor {
  id: string;
  recommendationId: string;
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  role?: string;
  createdAt: string;
}

export interface RecommendationAction {
  id: string;
  recommendationId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  responsibleId?: string;
  responsible?: { id: string; firstName: string; lastName: string; email: string };
  status: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationEvidence {
  id: string;
  recommendationId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  uploadedById: string;
  uploadedBy: { id: string; firstName: string; lastName: string; email: string };
  uploadedAt: string;
}

export interface RecommendationComment {
  id: string;
  recommendationId: string;
  content: string;
  isImportant: boolean;
  authorId: string;
  author: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationHistory {
  id: string;
  recommendationId: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
}

export interface RecommendationStats {
  total: number;
  byStatus: { status: RecommendationStatus; _count: number }[];
  byPriority: { priority: RecommendationPriority; _count: number }[];
  overdue: number;
}
