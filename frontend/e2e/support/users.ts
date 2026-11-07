import * as path from 'path';

/** Comptes créés par backend/test/setup/seed-ui.ts */
export const UI_PASSWORD = 'Planora#Ui2026';

export const USERS = {
  admin: { email: 'ui.admin@planora.test', name: 'Aminata', role: 'Administrateur' },
  coordinateur: { email: 'ui.coord@planora.test', name: 'Ousmane', role: 'Coordinateur' },
  observateur: { email: 'ui.obs@planora.test', name: 'Khady', role: 'Observateur' },
  autreOrgAdmin: { email: 'ui.autre.admin@planora.test', name: 'Pape', role: 'Administrateur' },
} as const;

export type UserKey = keyof typeof USERS;

export const SUPER_ADMIN = {
  email: process.env.E2E_SUPERADMIN_EMAIL ?? 'superadmin@planora.test',
  password: process.env.E2E_SUPERADMIN_PASSWORD ?? 'SuperAdmin#2026',
};

export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000/api';

export function storageStatePath(user: UserKey | 'superAdmin'): string {
  return path.join(__dirname, '..', '.auth', `${user}.json`);
}

export const SEED_FILE = path.join(__dirname, '..', '.auth', 'seed.json');
