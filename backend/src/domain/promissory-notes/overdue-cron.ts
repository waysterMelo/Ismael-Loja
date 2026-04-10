/**
 * Script para marcar títulos vencidos como OVERDUE.
 * Pode ser executado via cron ou Task Scheduler.
 *
 * Uso: npx tsx src/domain/promissory-notes/overdue-cron.ts
 */

import { OverdueJobService } from './overdue-job.service';

async function main() {
  console.log(`[${new Date().toISOString()}] Starting overdue check...`);

  const count = await OverdueJobService.markOverdue();

  if (count === 0) {
    console.log('No overdue titles found.');
  } else {
    console.log(`Updated ${count} title(s) to OVERDUE.`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
