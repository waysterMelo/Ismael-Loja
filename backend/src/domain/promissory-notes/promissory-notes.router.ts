import { Router } from 'express';
import { PromissoryNotesController } from './promissory-notes.controller';
import { OverdueJobService } from './overdue-job.service';
import { authMiddleware, roleGuard } from '../../shared/middleware';

export const promissoryNotesRouter = Router();

promissoryNotesRouter.use(authMiddleware);
promissoryNotesRouter.get('/', PromissoryNotesController.list);
promissoryNotesRouter.get('/export-csv', PromissoryNotesController.exportCSV);
promissoryNotesRouter.get('/:id', PromissoryNotesController.getById);
promissoryNotesRouter.patch('/:id/pay', PromissoryNotesController.pay);

// Cron job endpoint - marca vencidos como OVERDUE
promissoryNotesRouter.post('/mark-overdue', roleGuard('ADMIN'), async (_req, res) => {
  try {
    const updated = await OverdueJobService.markOverdue();
    res.json({ success: true, updated });
  } catch (e: unknown) {
    const err = e as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to mark overdue' });
  }
});
