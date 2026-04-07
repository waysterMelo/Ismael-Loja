import { Request, Response } from 'express';
import { SalesService } from './sales.service';
import { AuthRequest } from '../../shared/middleware';

type ParamId = { id: string };

export class SalesController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const sale = await SalesService.create(req.body, req.userId!);
      res.status(201).json({ sale });
    } catch (e: unknown) {
      const err = e as { statusCode?: number; message?: string };
      res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async list(_req: Request, res: Response) {
    const sales = await SalesService.listAll();
    res.json({ sales });
  }

  static async getById(req: Request, res: Response) {
    const sale = await SalesService.getById((req.params as ParamId).id);
    if (!sale) {
      res.status(404).json({ error: 'Sale not found' });
      return;
    }
    res.json({ sale });
  }
}
