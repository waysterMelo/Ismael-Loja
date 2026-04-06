import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../shared/utils';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export function authMiddleware(req: AuthRequest, _: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw Object.assign(new Error('Missing authorization token'), { statusCode: 401 });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    next();
  } catch {
    throw Object.assign(new Error('Invalid or expired token'), { statusCode: 401 });
  }
}

export function roleGuard(...roles: string[]) {
  return (req: AuthRequest, _: Response, next: NextFunction): void => {
    if (req.userRole && !roles.includes(req.userRole)) {
      throw Object.assign(new Error('Insufficient permissions'), { statusCode: 403 });
    }
    next();
  };
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const error = err as { statusCode?: number; message?: string };
  const status = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  res.status(status).json({ error: message });
}
