import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Les identifiants des comptes créés par le seed viennent du .env (jamais en dur dans le code)
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name} (voir .env.example)`);
  return value;
}

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
    data: {
      name: 'ATAABA',
      subscriptionPlan: 'ENTERPRISE',
      status: 'ACTIVE',
    },
  });

  const adminEmail = requireEnv('SEED_ADMIN_EMAIL');
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(requireEnv('SEED_ADMIN_PASSWORD'), 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: 'Super',
        lastName: 'Admin',
        passwordHash,
        organizationId: org.id,
        roleId: superAdminRole!.id,
      },
    });
    console.log(`Super admin créé : ${adminEmail}`);
  } else {
    console.log('Super admin existe déjà.');
  }

  // Organisation et compte test
  const existingTestOrg = await prisma.organization.findFirst({ where: { name: 'Test Org' } });
  const testOrg = existingTestOrg ?? await prisma.organization.create({
    data: {
      name: 'Test Org',
      subscriptionPlan: 'ENTERPRISE',
      status: 'ACTIVE',
    },
  });

  const coordRole = await prisma.role.findFirst({ where: { name: 'Coordinateur', organizationId: null } });

  const testEmail = requireEnv('SEED_TEST_EMAIL');
  const existingTest = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!existingTest) {
    const passwordHash = await bcrypt.hash(requireEnv('SEED_TEST_PASSWORD'), 12);
    await prisma.user.create({
      data: {
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        passwordHash,
        organizationId: testOrg.id,
        roleId: coordRole!.id,
      },
    });
    console.log(`Compte test créé : ${testEmail}`);
  } else {
    console.log('Compte test existe déjà.');
  }

  // Seed zones géographiques pour ATAABA (Sénégal)
  console.log('Seeding zones géographiques...');
  const existingSenegal = await prisma.geographicZone.findFirst({
    where: { organizationId: org.id, code: 'SN' },
  });

  if (!existingSenegal) {
    const senegal = await prisma.geographicZone.create({
      data: {
        name: 'Sénégal',
        code: 'SN',
        level: 0,
        organizationId: org.id,
      },
    });

    const regions = [
      { name: 'Dakar', code: 'DK' },
      { name: 'Thiès', code: 'TH' },
      { name: 'Saint-Louis', code: 'SL' },
      { name: 'Diourbel', code: 'DB' },
      { name: 'Kaolack', code: 'KL' },
      { name: 'Fatick', code: 'FK' },
      { name: 'Louga', code: 'LG' },
      { name: 'Matam', code: 'MT' },
      { name: 'Tambacounda', code: 'TC' },
      { name: 'Kolda', code: 'KD' },
      { name: 'Ziguinchor', code: 'ZG' },
      { name: 'Sédhiou', code: 'SD' },
      { name: 'Kaffrine', code: 'KF' },
      { name: 'Kédougou', code: 'KE' },
    ];

    for (const region of regions) {
      await prisma.geographicZone.create({
        data: {
          name: region.name,
          code: region.code,
          level: 1,
          parentId: senegal.id,
          organizationId: org.id,
        },
      });
    }

    console.log(`✅ ${regions.length + 1} zones géographiques créées (Sénégal + régions)`);
  } else {
    console.log('Zones géographiques existent déjà.');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
