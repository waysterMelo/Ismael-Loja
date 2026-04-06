import { Router } from 'express';
import { PromissoryNotesController } from './promissory-notes.controller';
import { authMiddleware } from '../../shared/middleware';

export const promissoryNotesRouter = Router();

promissoryNotesRouter.use(authMiddleware);
promissoryNotesRouter.get('/', PromissoryNotesController.list);
promissoryNotesRouter.get('/:id', PromissoryNotesController.getById);
promissoryNotesRouter.patch('/:id/pay', PromissoryNotesController.pay);
promissoryNotesRouter.patch('/:id/mark-whatsapp', PromissoryNotesController.markWhatsApp);
