import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ROLES = [
  { name: 'super_admin', permissions: ['*'] },
  {
    name: 'org_admin',
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
    name: 'coordonnateur',
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
    name: 'resp_projet',
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
    name: 'chef_service',
    permissions: [
      'activity.create', 'activity.update', 'activity.read',
      'checklist.create', 'checklist.update',
      'validation.approve', 'validation.reject',
      'document.upload', 'document.download',
      'report.generate', 'dashboard.view',
    ],
  },
  {
    name: 'resp_activite',
    permissions: [
      'activity.update', 'activity.read',
      'checklist.create', 'checklist.update',
      'validation.submit',
      'document.upload', 'document.download',
      'dashboard.view',
    ],
  },
  {
    name: 'validateur',
    permissions: [
      'activity.read',
      'validation.approve', 'validation.reject',
      'document.download',
      'dashboard.view',
    ],
  },
  {
    name: 'resp_financier',
    permissions: [
      'activity.read',
      'budget.read', 'budget.edit',
      'validation.approve', 'validation.reject',
      'document.download',
      'report.generate', 'dashboard.view',
    ],
  },
  {
    name: 'lecture_seule',
    permissions: ['activity.read', 'plan.read', 'document.download', 'dashboard.view'],
  },
  {
    name: 'auditeur',
    permissions: ['activity.read', 'plan.read', 'document.download', 'report.generate', 'dashboard.view'],
  },
];

async function main() {
  console.log('Seeding roles...');
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { permissions: role.permissions },
      create: role,
    });
  }
  console.log(`${ROLES.length} rôles créés/mis à jour.`);

  const superAdminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });

  const existingOrg = await prisma.organization.findFirst({ where: { name: 'ATAABA' } });
  const org = existingOrg ?? await prisma.organization.create({
    data: { name: 'ATAABA', subscriptionPlan: 'SUR_MESURE' },
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
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
