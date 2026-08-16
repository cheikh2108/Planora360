import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        organization: true,
        role: true,
      },
      take: 10,
    });

    console.log('\n=== UTILISATEURS DANS LA BASE ===\n');

    for (const user of users) {
      console.log(`Email: ${user.email}`);
      console.log(`Nom: ${user.firstName} ${user.lastName}`);
      console.log(`Actif: ${user.isActive}`);
      console.log(`Organisation: ${user.organization?.name} (Status: ${user.organization?.status})`);
      console.log(`Rôle: ${user.role?.name}`);
      console.log(`Doit changer mdp: ${user.mustChangePassword}`);
      console.log('---\n');
    }

    // Test du mot de passe admin
    const admin = users.find(u => u.email === 'admin@ataaba.com');
    if (admin) {
      console.log('=== TEST MOT DE PASSE ADMIN ===');
      const testPasswords = ['Admin@2108!', 'admin123', 'Admin123!', 'password'];

      for (const pwd of testPasswords) {
        const match = await bcrypt.compare(pwd, admin.passwordHash);
        console.log(`"${pwd}": ${match ? '✅ VALIDE' : '❌ Invalide'}`);
      }
    }

    // Test pour test user
    const testUser = users.find(u => u.email === 'test@ataaba.com');
    if (testUser) {
      console.log('\n=== TEST MOT DE PASSE TEST USER ===');
      const testPasswords = ['Test@2108!', 'test123', 'Test123!'];

      for (const pwd of testPasswords) {
        const match = await bcrypt.compare(pwd, testUser.passwordHash);
        console.log(`"${pwd}": ${match ? '✅ VALIDE' : '❌ Invalide'}`);
      }
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
