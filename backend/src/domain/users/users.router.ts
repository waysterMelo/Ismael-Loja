import { Router } from 'express';
import { UserController } from './users.controller';
import { authMiddleware, roleGuard } from '../../shared/middleware';

export const usersRouter = Router();

// Todas as rotas de usuários requerem autenticação
usersRouter.use(authMiddleware);

// Listagem e busca - disponível para ADMIN
usersRouter.get('/', roleGuard('ADMIN'), UserController.list);
usersRouter.get('/:id', roleGuard('ADMIN'), UserController.getById);

// Operações de escrita - apenas ADMIN
usersRouter.post('/', roleGuard('ADMIN'), UserController.create);
usersRouter.patch('/:id', roleGuard('ADMIN'), UserController.update);
usersRouter.patch('/:id/deactivate', roleGuard('ADMIN'), UserController.deactivate);
usersRouter.patch('/:id/activate', roleGuard('ADMIN'), UserController.activate);
usersRouter.patch('/:id/reset-password', roleGuard('ADMIN'), UserController.resetPassword);
