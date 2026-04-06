import { Request, Response } from 'express';
import { CustomerService } from './customers.service';
import { AuthRequest } from '../../shared/middleware';

export class CustomerController {
  static async list(_req: Request, res: Response) {
    const customers = await CustomerService.listAll();
    res.json({ customers });
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const customer = await CustomerService.create(req.body);
      res.status(201).json({ customer });
    } catch (e: any) {
      const status = e.statusCode || 400;
      res.status(status).json({ error: e.message });
    }
  }

  static async search(req: Request, res: Response) {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Query parameter q is required' });
      return;
    }
    const customers = await CustomerService.search(query);
    res.json({ customers });
  }

  static async update(req: Request, res: Response) {
    try {
      const customer = await CustomerService.update(req.params.id, req.body);
      res.json({ customer });
    } catch (e: any) {
      const status = e.statusCode || 400;
      res.status(status).json({ error: e.message });
    }
  }

  static async notes(req: Request, res: Response) {
    const notes = await CustomerService.getNotesByCustomerId(req.params.id);
    res.json({ notes });
  }
}
