import { Router } from 'express';
import { AuthService } from './auth.service';

export const authRouter = Router();

authRouter.post('/login', AuthService.login);
authRouter.get('/me', AuthService.me);
