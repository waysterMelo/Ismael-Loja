import { Response, Request, NextFunction } from 'express';

/**
 * Helper para tratamento de erros consistente em todos os controllers
 * Usa AppError quando disponível, fallback para erro genérico
 */
export function handleError(res: Response, error: unknown, defaultMessage: string = 'Internal server error') {
  const err = error as { statusCode?: number; message?: string };
  const statusCode = err.statusCode || 500;
  const message = err.message || defaultMessage;
  res.status(statusCode).json({ error: message });
}

/**
 * Wrapper para controllers com tratamento de erro automático
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
