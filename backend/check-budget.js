const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const budgets = await prisma.budget.findMany({
      include: { activity: { select: { title: true } } }
    });

    console.log('=== Lignes Budget ===');
    if (budgets.length === 0) {
      console.log('Aucune ligne budget trouvée');
    } else {
      budgets.forEach(b => {
        console.log(JSON.stringify({
          activity: b.activity.title,
          planned: Number(b.planned),
          committed: Number(b.committed),
          executed: Number(b.executed),
        }));
      });
    }

    const plans = await prisma.actionPlan.findMany({
      select: { title: true, budgetPrevisional: true, status: true },
      where: { status: { not: 'ARCHIVE' } }
    });

    console.log('\n=== Plans (Budget Prévisionnel) ===');
    plans.forEach(p => {
      console.log(JSON.stringify({
        title: p.title,
        budgetPrevisional: Number(p.budgetPrevisional || 0),
        status: p.status
      }));
    });
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
