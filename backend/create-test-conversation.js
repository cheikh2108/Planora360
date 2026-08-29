const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Récupérer un utilisateur existant
    const user = await prisma.user.findFirst({
      where: { organizationId: { not: null } }
    });

    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé:', user.email);

    // Récupérer un deuxième utilisateur pour la conversation
    const otherUser = await prisma.user.findFirst({
      where: { 
        organizationId: user.organizationId,
        id: { not: user.id }
      }
    });

    if (!otherUser) {
      console.log('⚠️  Pas d\'autre utilisateur, création conversation avec soi-même');
    }

    // Créer une conversation de test
    const conversation = await prisma.conversation.create({
      data: {
        organizationId: user.organizationId,
        type: 'DIRECT',
        createdById: user.id,
        participants: {
          create: [
            {
              userId: user.id,
              role: 'ADMIN'
            },
            {
              userId: otherUser?.id || user.id,
              role: 'MEMBER'
            }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    console.log('✅ Conversation créée:', conversation.id);
    console.log('📝 URL:', `http://localhost:3001/messagerie/${conversation.id}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
