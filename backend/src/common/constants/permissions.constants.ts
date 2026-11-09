/**
 * Catalogue des permissions attribuables à un rôle personnalisé.
 * Doit rester aligné avec ALL_PERMISSIONS (frontend/src/lib/types.ts) et prisma/seed.ts.
 * Le joker "*" n'en fait volontairement pas partie : il est réservé au rôle système Super administrateur.
 */
export const PERMISSIONS = [
  'user.create', 'user.update', 'user.delete', 'user.read',
  'plan.create', 'plan.update', 'plan.delete', 'plan.read',
  'activity.create', 'activity.update', 'activity.delete', 'activity.read',
  'checklist.create', 'checklist.update', 'checklist.delete',
  'validation.submit', 'validation.approve', 'validation.reject',
  'budget.read', 'budget.edit',
  'document.upload', 'document.download',
  'report.generate', 'dashboard.view',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const WILDCARD_PERMISSION = '*';
