import { Router } from 'express';
import { SalesController } from './sales.controller';
import { authMiddleware, roleGuard } from '../../shared/middleware';

export const salesRouter = Router();

salesRouter.use(authMiddleware);
salesRouter.post('/', SalesController.create);
salesRouter.get('/', roleGuard('ADMIN'), SalesController.list);
salesRouter.get('/:id', SalesController.getById);
