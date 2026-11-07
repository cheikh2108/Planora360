import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { ApiClient } from './api-client';

export const DEFAULT_PASSWORD = 'Planora#Test2026';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  role: string;
}

export interface Tenant {
  org: { id: string; name: string };
  users: Record<string, TestUser>;
}

async function systemRoleId(prisma: PrismaService, name: string): Promise<string> {
  const role = await prisma.role.findFirst({ where: { name, organizationId: null } });
  if (!role) throw new Error(`Rôle système "${name}" absent : le seed n'a pas tourné ?`);
  return role.id;
}

/** Crée un utilisateur directement en base, avec un rôle système. */
export async function createUser(
  prisma: PrismaService,
  orgId: string,
  roleName: string,
  label: string,
  overrides: Partial<{ isActive: boolean; deletedAt: Date }> = {},
): Promise<TestUser> {
  const email = `${label}.${randomUUID().slice(0, 8)}@planora.test`.toLowerCase();
  const user = await prisma.user.create({
    data: {
      email,
      firstName: label,
      lastName: 'Test',
      passwordHash: await bcrypt.hash(DEFAULT_PASSWORD, 4),
      organizationId: orgId,
      roleId: await systemRoleId(prisma, roleName),
      ...overrides,
    },
  });
  return { id: user.id, email, password: DEFAULT_PASSWORD, role: roleName };
}

/**
 * Crée une organisation active (plan ENTERPRISE par défaut) avec un utilisateur par rôle utile aux tests.
 */
export async function createTenant(
  prisma: PrismaService,
  label: string,
  opts: { plan?: any; status?: any } = {},
): Promise<Tenant> {
  const org = await prisma.organization.create({
    data: {
      name: `${label} ${randomUUID().slice(0, 6)}`,
      subscriptionPlan: opts.plan ?? 'ENTERPRISE',
      status: opts.status ?? 'ACTIVE',
      subscriptionStatus: 'ACTIVE',
    },
  });
  const users: Record<string, TestUser> = {
    admin: await createUser(prisma, org.id, 'Administrateur', `${label}-admin`),
    coordinateur: await createUser(prisma, org.id, 'Coordinateur', `${label}-coord`),
    observateur: await createUser(prisma, org.id, 'Observateur', `${label}-obs`),
    validateur: await createUser(prisma, org.id, 'Validateur', `${label}-valid`),
    financier: await createUser(prisma, org.id, 'Responsable financier', `${label}-fin`),
  };
  return { org: { id: org.id, name: org.name }, users };
}

export function login(http: any, user: TestUser) {
  return ApiClient.loggedIn(http, user.email, user.password);
}

export function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString();
}

/** Crée via l'API un plan d'action avec un axe et une activité. */
export async function createPlanWithActivity(api: ApiClient, title = 'Plan test') {
  const planRes = await api.post('/api/action-plans', {
    title,
    periodStart: isoDate(-30),
    periodEnd: isoDate(335),
    strategicGoals: 'Objectifs de test',
    axes: [{ title: 'Axe 1' }],
  });
  if (planRes.status !== 201) throw new Error(`Création plan : ${planRes.status} ${JSON.stringify(planRes.body)}`);
  const plan = planRes.body;
  const axisId = plan.axes?.[0]?.id;
  const actRes = await api.post('/api/activities', {
    title: `${title} - activité`,
    axisId,
    startDate: isoDate(0),
    dueDate: isoDate(60),
    priority: 'NORMALE',
  });
  if (actRes.status !== 201) throw new Error(`Création activité : ${actRes.status} ${JSON.stringify(actRes.body)}`);
  return { plan, axisId, activity: actRes.body };
}
