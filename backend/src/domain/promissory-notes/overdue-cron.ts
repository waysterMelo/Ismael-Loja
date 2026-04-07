/**
 * Script para marcar títulos vencidos como OVERDUE.
 * Pode ser executado via cron ou Task Scheduler.
 *
 * Uso: npx tsx src/domain/promissory-notes/overdue-cron.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(`[${new Date().toISOString()}] Starting overdue check...`);

  // Busca títulos pendentes vencidos
  const overdueNotes = await prisma.promissoryNote.findMany({
    where: {
      status: 'PENDING',
      dueDate: { lt: today },
    },
    select: { id: true, dueDate: true, totalAmount: true },
  });

  if (overdueNotes.length === 0) {
    console.log('No overdue titles found.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${overdueNotes.length} overdue title(s). Updating...`);

  // Atualiza em batch
  const ids = overdueNotes.map(n => n.id);
  const result = await prisma.promissoryNote.updateMany({
    where: { id: { in: ids } },
    data: { status: 'OVERDUE' },
  });

  console.log(`Updated ${result.count} title(s) to OVERDUE.`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
