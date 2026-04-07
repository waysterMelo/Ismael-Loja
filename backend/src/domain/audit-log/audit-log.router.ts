import { Router } from 'express';
import { AuditLogController } from './audit-log.controller';
import { authMiddleware, roleGuard } from '../../shared/middleware';

export const auditLogRouter = Router();

auditLogRouter.use(authMiddleware);
auditLogRouter.get('/', roleGuard('ADMIN'), AuditLogController.list);
