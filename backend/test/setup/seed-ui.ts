/**
 * Données de démonstration pour les tests d'écran (Playwright).
 * Usage : DATABASE_URL=... npx ts-node test/setup/seed-ui.ts
 * Idempotent : supprime puis recrée les organisations "E2E ...".
 * À lancer UNIQUEMENT sur une base de développement ou de test.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

export const UI_PASSWORD = 'Planora#Ui2026';
export const UI_USERS = {
  admin: 'ui.admin@planora.test',
  coordinateur: 'ui.coord@planora.test',
  observateur: 'ui.obs@planora.test',
  autreOrgAdmin: 'ui.autre.admin@planora.test',
};

const url = process.env.DATABASE_URL ?? '';
if (/neon\.tech|prod/i.test(url)) {
  throw new Error(
    'seed-ui refuse de tourner sur une base qui ressemble à la production.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

async function role(name: string) {
  const r = await prisma.role.findFirst({
    where: { name, organizationId: null },
  });
  if (!r)
    throw new Error(
      `Rôle système ${name} absent : lancez d'abord prisma/seed.ts`,
    );
  return r.id;
}

/**
 * Archive les organisations E2E d'un lancement précédent (soft delete + renommage).
 * On ne supprime pas : le schéma interdit la suppression en cascade des utilisateurs.
 */
async function resetOrg(name: string) {
  const stamp = Date.now();
  const existing = await prisma.organization.findMany({ where: { name } });
  for (const org of existing) {
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        name: `${name} (archivée ${stamp})`,
        deletedAt: new Date(),
      } as any,
    });
  }
  const oldUsers = await prisma.user.findMany({
    where: { email: { in: Object.values(UI_USERS) } },
  });
  for (const u of oldUsers) {
    await prisma.user.update({
      where: { id: u.id },
      data: {
        email: `archive.${stamp}.${u.email}`,
        isActive: false,
        deletedAt: new Date(),
      } as any,
    });
  }
}

async function createOrg(name: string) {
  return prisma.organization.create({
    data: {
      name,
      subscriptionPlan: 'ENTERPRISE',
      status: 'ACTIVE',
      subscriptionStatus: 'ACTIVE',
    } as any,
  });
}

async function createUser(
  orgId: string,
  email: string,
  roleName: string,
  firstName: string,
  lastName: string,
  passwordHash: string,
) {
  return prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash,
      organizationId: orgId,
      roleId: await role(roleName),
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(UI_PASSWORD, 10);

  await resetOrg('E2E Agence Démo');
  await resetOrg('E2E Autre Organisation');

  const org = await createOrg('E2E Agence Démo');
  const admin = await createUser(
    org.id,
    UI_USERS.admin,
    'Administrateur',
    'Aminata',
    'Diallo',
    passwordHash,
  );
  const coord = await createUser(
    org.id,
    UI_USERS.coordinateur,
    'Coordinateur',
    'Ousmane',
    'Faye',
    passwordHash,
  );
  await createUser(
    org.id,
    UI_USERS.observateur,
    'Observateur',
    'Khady',
    'Mbaye',
    passwordHash,
  );

  const plan = await prisma.actionPlan.create({
    data: {
      title: 'Plan de développement 2027',
      organizationId: org.id,
      periodStart: new Date('2027-01-01'),
      periodEnd: new Date('2027-12-31'),
      strategicGoals: "Améliorer l'accès aux services",
      axes: {
        create: [
          { title: 'Gouvernance', order: 0 },
          { title: 'Services aux usagers', order: 1 },
        ],
      },
    } as any,
    include: { axes: true },
  });

  const axis = plan.axes[0];
  await prisma.activity.create({
    data: {
      title: 'Atelier de lancement',
      organizationId: org.id,
      axisId: axis.id,
      responsibleId: coord.id,
      startDate: new Date('2027-01-15'),
      dueDate: new Date('2027-02-15'),
    } as any,
  });
  await prisma.activity.create({
    data: {
      title: 'Formation des agents',
      organizationId: org.id,
      axisId: axis.id,
      responsibleId: admin.id,
      startDate: new Date('2027-03-01'),
      dueDate: new Date('2027-04-30'),
    } as any,
  });

  const other = await createOrg('E2E Autre Organisation');
  await createUser(
    other.id,
    UI_USERS.autreOrgAdmin,
    'Administrateur',
    'Pape',
    'Sarr',
    passwordHash,
  );
  const otherPlan = await prisma.actionPlan.create({
    data: {
      title: 'Plan secret autre organisation',
      organizationId: other.id,
      periodStart: new Date('2027-01-01'),
      periodEnd: new Date('2027-12-31'),
      axes: { create: [{ title: 'Axe secret', order: 0 }] },
    } as any,
  });

  console.log(
    JSON.stringify({
      orgId: org.id,
      planId: plan.id,
      otherPlanId: otherPlan.id,
    }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
