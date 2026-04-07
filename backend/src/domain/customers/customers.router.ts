import { Router } from 'express';
import { CustomerController } from './customers.controller';
import { authMiddleware } from '../../shared/middleware';

export const customersRouter = Router();

customersRouter.use(authMiddleware);
customersRouter.get('/', CustomerController.list);
customersRouter.post('/', CustomerController.create);
customersRouter.get('/search', CustomerController.search);
customersRouter.get('/:id', CustomerController.getById);
customersRouter.patch('/:id', CustomerController.update);
