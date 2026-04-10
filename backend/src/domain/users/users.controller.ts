import { Request, Response } from 'express';
import { UserService } from './users.service';
import { AuthRequest } from '../../shared/middleware';
import { handleError } from '../../shared/error-handler';

type ParamId = { id: string };

export class UserController {
  static async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await UserService.listAll({ page, limit });
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const user = await UserService.create(req.body, req.userId!);
      res.status(201).json({ user });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const user = await UserService.getById((req.params as ParamId).id);
      res.json({ user });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const user = await UserService.update((req.params as ParamId).id, req.body, req.userId!);
      res.json({ user });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deactivate(req: AuthRequest, res: Response) {
    try {
      const user = await UserService.deactivate((req.params as ParamId).id, req.userId!);
      res.json({ user });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async activate(req: AuthRequest, res: Response) {
    try {
      const user = await UserService.activate((req.params as ParamId).id, req.userId!);
      res.json({ user });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async resetPassword(req: AuthRequest, res: Response) {
    try {
      const { password } = req.body as { password: string };
      if (!password) {
        res.status(400).json({ error: 'Password is required' });
        return;
      }
      const user = await UserService.resetPassword((req.params as ParamId).id, password, req.userId!);
      res.json({ user });
    } catch (error) {
      handleError(res, error);
    }
  }
}
