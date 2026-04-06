import { Router } from 'express';
import { SalesController } from './sales.controller';
import { authMiddleware } from '../../shared/middleware';

export const salesRouter = Router();

salesRouter.use(authMiddleware);
salesRouter.post('/', SalesController.create);
salesRouter.get('/', SalesController.list);
salesRouter.get('/:id', SalesController.getById);
