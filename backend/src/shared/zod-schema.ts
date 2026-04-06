import { ZodError } from 'zod';

export function zodMiddleware(schema: ReturnType<import('zod').ZodSchema>, req: Request) {
  return schema.parse(req.body);
}

export function formatZodError(err: ZodError): string {
  const firstError = err.errors[0];
  return `${firstError.path.join('.')}: ${firstError.message}`;
}
