import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../shared/utils';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function authMiddleware(req: AuthRequest, _: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Missing authorization token', 401);
  }

  const token = header.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}

export function roleGuard(...roles: string[]) {
  return (req: AuthRequest, _: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      throw new AppError(
        `Access denied. Required roles: ${roles.join(', ')}, received: ${req.userRole || 'none'}`,
        403
      );
    }
    next();
  };
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  if (err instanceof Error) {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      statusCode: 500,
    });
    return;
  }

  console.error('Unknown error:', err);
  res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  });
}
