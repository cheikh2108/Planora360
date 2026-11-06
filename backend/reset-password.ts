import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

// Réinitialise le mot de passe d'un compte.
// Usage : RESET_EMAIL=... RESET_PASSWORD=... npx ts-node reset-password.ts
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.RESET_EMAIL;
  const password = process.env.RESET_PASSWORD;
  if (!email || !password) {
    throw new Error('RESET_EMAIL et RESET_PASSWORD sont requis');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  console.log(`✅ Mot de passe réinitialisé pour ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
