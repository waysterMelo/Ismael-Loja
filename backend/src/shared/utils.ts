import * as jwt from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET || 'dev-secret') as jwt.Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): { userId: string; email: string; role: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
}

export function sanitizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Se já começa com 55 e tem 13 dígitos (55 + DDD + número), retornar como está
  if (digits.startsWith('55') && digits.length === 13) {
    return digits;
  }

  // Se tem 11 dígitos (DDD + número), adicionar 55
  if (digits.length === 11 && !digits.startsWith('55')) {
    return '55' + digits;
  }

  // Se tem 13 dígitos mas não começa com 55, algo está errado, mas tentar adicionar
  if (digits.length === 13 && !digits.startsWith('55')) {
    return '55' + digits;
  }

  // Caso padrão: adicionar 55
  if (!digits.startsWith('55')) {
    return '55' + digits;
  }

  return digits;
}
