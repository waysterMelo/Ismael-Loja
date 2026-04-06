import { Request, Response } from 'express';
import { SalesService } from './sales.service';
import { AuthRequest } from '../../shared/middleware';

export class SalesController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const sale = await SalesService.create(req.body, req.userId!);
      res.status(201).json({ sale });
    } catch (e: any) {
      const status = e.statusCode || 400;
      res.status(status).json({ error: e.message });
    }
  }

  static async list(req: Request, res: Response) {
    const sales = await SalesService.listAll();
    res.json({ sales });
  }

  static async getById(req: Request, res: Response) {
    const sale = await SalesService.getById(req.params.id);
    if (!sale) {
      res.status(404).json({ error: 'Sale not found' });
      return;
    }
    res.json({ sale });
  }
}
