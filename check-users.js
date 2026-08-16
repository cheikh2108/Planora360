// Script pour vérifier les utilisateurs
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_HvOsD9QXbKY3@ep-jolly-dream-axltifx2.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

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
      console.log('---');
    }

    // Test du mot de passe admin
    const admin = users.find(u => u.email === 'admin@ataaba.com');
    if (admin) {
      console.log('\n=== TEST MOT DE PASSE ADMIN ===');
      const testPasswords = ['Admin@2108!', 'admin123', 'Admin123!', 'password'];

      for (const pwd of testPasswords) {
        const match = await bcrypt.compare(pwd, admin.passwordHash);
        console.log(`"${pwd}": ${match ? '✅ VALIDE' : '❌ Invalide'}`);
      }
    }

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
