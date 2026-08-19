import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function debug() {
  console.log('\n=== 1. Organisation du super admin ===');
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@ataaba.com' },
    include: { organization: true }
  });
  console.log({
    email: admin?.email,
    adminOrgId: admin?.organizationId,
    adminOrgName: admin?.organization?.name,
    adminOrgDeleted: admin?.organization?.deletedAt,
  });

  console.log('\n=== 2. Organisations récemment supprimées ===');
  const deletedOrgs = await prisma.organization.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      status: true,
      deletedAt: true,
      createdAt: true,
    }
  });
  console.table(deletedOrgs);

  console.log('\n=== 3. Users récemment soft deleted ===');
  const deletedUsers = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
    take: 10,
    include: { organization: { select: { name: true } } },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      organizationId: true,
      deletedAt: true,
      organization: { select: { name: true } }
    }
  });
  console.table(deletedUsers.map(u => ({
    email: u.email,
    name: `${u.firstName} ${u.lastName}`,
    orgId: u.organizationId,
    orgName: u.organization?.name,
    deletedAt: u.deletedAt
  })));

  await prisma.$disconnect();
}

debug().catch(console.error);
