import { Router } from 'express';
import { CustomerController } from './customers.controller';
import { authMiddleware, roleGuard } from '../../shared/middleware';

export const customersRouter = Router();

customersRouter.use(authMiddleware);
customersRouter.get('/', CustomerController.list);
customersRouter.get('/search', CustomerController.search);
customersRouter.get('/:id', CustomerController.getById);
customersRouter.post('/', roleGuard('ADMIN'), CustomerController.create);
customersRouter.patch('/:id', roleGuard('ADMIN'), CustomerController.update);
