import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ROLES = [
  { name: 'Super administrateur', permissions: ['*'] },
  {
    name: 'Administrateur',
    permissions: [
      'user.create', 'user.update', 'user.delete', 'user.read',
      'plan.create', 'plan.update', 'plan.delete', 'plan.read',
      'activity.create', 'activity.update', 'activity.delete', 'activity.read',
      'checklist.create', 'checklist.update', 'checklist.delete',
      'validation.approve', 'validation.reject',
      'budget.read', 'budget.edit',
      'document.upload', 'document.download',
      'report.generate', 'dashboard.view',
    ],
  },
  {
    name: 'Coordinateur',
    permissions: [
      'plan.create', 'plan.update', 'plan.read',
      'activity.create', 'activity.update', 'activity.read',
      'checklist.create', 'checklist.update',
      'validation.approve', 'validation.reject',
      'document.upload', 'document.download',
      'report.generate', 'dashboard.view',
    ],
  },
  {
    name: 'Responsable de projet',
    permissions: [
      'plan.create', 'plan.update', 'plan.read',
      'activity.create', 'activity.update', 'activity.read',
      'checklist.create', 'checklist.update',
      'validation.approve', 'validation.reject',
      'budget.read', 'budget.edit',
      'document.upload', 'document.download',
      'report.generate', 'dashboard.view',
    ],
  },
  {
    name: 'Chef de service',
    permissions: [
      'activity.create', 'activity.update', 'activity.read',
      'checklist.create', 'checklist.update',
      'validation.approve', 'validation.reject',
      'document.upload', 'document.download',
      'report.generate', 'dashboard.view',
    ],
  },
  {
    name: "Responsable d'activité",
    permissions: [
      'activity.update', 'activity.read',
      'checklist.create', 'checklist.update',
      'validation.submit',
      'document.upload', 'document.download',
      'dashboard.view',
    ],
  },
  {
    name: 'Validateur',
    permissions: [
      'activity.read',
      'validation.approve', 'validation.reject',
      'document.download',
      'dashboard.view',
    ],
  },
  {
    name: 'Responsable financier',
    permissions: [
      'activity.read',
      'budget.read', 'budget.edit',
      'validation.approve', 'validation.reject',
      'document.download',
      'report.generate', 'dashboard.view',
    ],
  },
  {
    name: 'Observateur',
    permissions: ['activity.read', 'plan.read', 'document.download', 'dashboard.view'],
  },
  {
    name: 'Auditeur',
    permissions: ['activity.read', 'plan.read', 'document.download', 'report.generate', 'dashboard.view'],
  },
];

async function main() {
  console.log('Seeding roles...');
  for (const role of ROLES) {
    const existing = await prisma.role.findFirst({ where: { name: role.name, organizationId: null } });
    if (existing) {
      await prisma.role.update({ where: { id: existing.id }, data: { permissions: role.permissions } });
    } else {
      await prisma.role.create({ data: { ...role, organizationId: null } });
    }
  }
  console.log(`${ROLES.length} rôles créés/mis à jour.`);

  const superAdminRole = await prisma.role.findFirst({ where: { name: 'Super administrateur', organizationId: null } });

  const existingOrg = await prisma.organization.findFirst({ where: { name: 'ATAABA' } });
  const org = existingOrg ?? await prisma.organization.create({
    data: { name: 'ATAABA', subscriptionPlan: 'ENTERPRISE' },
  });

  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@ataaba.com' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@2108!', 12);
    await prisma.user.create({
      data: {
        email: 'admin@ataaba.com',
        firstName: 'Super',
        lastName: 'Admin',
        passwordHash,
        organizationId: org.id,
        roleId: superAdminRole!.id,
      },
    });
    console.log('Super admin créé : admin@ataaba.com / Admin@2108!');
  } else {
    console.log('Super admin existe déjà.');
  }

  // Organisation et compte test
  const existingTestOrg = await prisma.organization.findFirst({ where: { name: 'Test Org' } });
  const testOrg = existingTestOrg ?? await prisma.organization.create({
    data: { name: 'Test Org', subscriptionPlan: 'ENTERPRISE' },
  });

  const coordRole = await prisma.role.findFirst({ where: { name: 'Coordinateur', organizationId: null } });

  const existingTest = await prisma.user.findUnique({ where: { email: 'test@ataaba.com' } });
  if (!existingTest) {
    const passwordHash = await bcrypt.hash('Test@2108!', 12);
    await prisma.user.create({
      data: {
        email: 'test@ataaba.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash,
        organizationId: testOrg.id,
        roleId: coordRole!.id,
      },
    });
    console.log('Compte test créé : test@ataaba.com / Test@2108!');
  } else {
    console.log('Compte test existe déjà.');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
