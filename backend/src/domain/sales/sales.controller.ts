import { Request, Response } from 'express';
import { SalesService } from './sales.service';
import { AuthRequest } from '../../shared/middleware';
import { handleError } from '../../shared/error-handler';

type ParamId = { id: string };

export class SalesController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const sale = await SalesService.create(req.body, req.userId!);
      res.status(201).json({ sale });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await SalesService.listAll({ page, limit });
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const sale = await SalesService.getById((req.params as ParamId).id);
      if (!sale) {
        res.status(404).json({ error: 'Sale not found' });
        return;
      }
      res.json({ sale });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async softDelete(req: AuthRequest, res: Response) {
    try {
      const sale = await SalesService.softDelete((req.params as ParamId).id, req.userId!);
      res.json({ sale });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async restore(req: AuthRequest, res: Response) {
    try {
      const sale = await SalesService.restore((req.params as ParamId).id, req.userId!);
      res.json({ sale });
    } catch (error) {
      handleError(res, error);
    }
  }
}
