import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Admin@2108!', 12);

  await prisma.user.update({
    where: { email: 'admin@ataaba.com' },
    data: { passwordHash }
  });

  console.log('✅ Mot de passe réinitialisé : Admin@2108!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
