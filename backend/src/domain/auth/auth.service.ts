import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../../shared/prisma';
import { generateToken } from '../../shared/utils';

const loginSchema = z.object({
  email: z.string().min(1).max(255),
  password: z.string().min(6).max(255),
});

export class AuthService {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.active) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (e: unknown) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ error: e.errors[0].message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async me(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing token' });
      return;
    }

    try {
      const { verifyToken } = await import('../../shared/utils');
      const decoded = verifyToken(authHeader.split(' ')[1]);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, role: true, active: true },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}
