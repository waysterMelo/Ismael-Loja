import * as jwt from 'jsonwebtoken';

export function generateToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { userId: string; email: string; role: string };
}

export function sanitizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  return '55' + digits;
}
