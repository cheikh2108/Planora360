/**
 * Droits d'écriture affichés à l'écran : miroir des contrôles du backend (@Roles / @WriteRoles).
 * Le backend reste la seule autorité ; ces règles évitent seulement de proposer une action
 * qui serait refusée (bouton masqué, page admin redirigée).
 *
 * Comme côté serveur, seuls les rôles système (organizationId null) comptent par leur nom :
 * un rôle personnalisé nommé « Administrateur » n'hérite pas de ces droits.
 */
import type { User } from './types';

/** Rôle tel que renvoyé par /auth/me (organizationId null = rôle système). */
type SessionRole = { name?: string; organizationId?: string | null };

export const SUPER_ADMIN = 'Super administrateur';

export const ACCESS = {
  /** Créer / modifier un plan d'action, ses axes, l'importer */
  planWrite: ['Administrateur', 'Coordinateur', 'Responsable de projet'],
  /** Supprimer un plan */
  planDelete: ['Administrateur', 'Coordinateur'],
  /** Consulter la liste des utilisateurs */
  usersRead: ['Administrateur', 'Coordinateur'],
  /** Créer, modifier, supprimer des utilisateurs et des rôles */
  usersWrite: ['Administrateur'],
  rolesWrite: ['Administrateur'],
} as const;

export type AccessKey = keyof typeof ACCESS;

export function isSuperAdminUser(user: User | null | undefined): boolean {
  const role = user?.role as SessionRole | undefined;
  return !!role && role.name === SUPER_ADMIN && (role.organizationId ?? null) === null;
}

/** L'utilisateur a-t-il l'un des rôles système autorisés pour cette action ? */
export function canAccess(user: User | null | undefined, key: AccessKey): boolean {
  if (!user?.role) return false;
  if (isSuperAdminUser(user)) return true;
  const role = user.role as SessionRole;
  const isSystemRole = (role.organizationId ?? null) === null;
  return isSystemRole && !!role.name && (ACCESS[key] as readonly string[]).includes(role.name);
}
