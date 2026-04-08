import { Request, Response } from 'express';
import { CustomerService } from './customers.service';
import { AuthRequest } from '../../shared/middleware';

type ParamId = { id: string };

export class CustomerController {
  static async list(_req: Request, res: Response) {
    const customers = await CustomerService.listAll();
    res.json({ customers });
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const customer = await CustomerService.create(req.body, req.userId!);
      res.status(201).json({ customer });
    } catch (e: unknown) {
      const err = e as { statusCode?: number; message?: string };
      res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async search(req: Request, res: Response) {
    const query = req.query.query as string;
    if (!query) {
      res.status(400).json({ error: 'Query parameter query is required' });
      return;
    }
    const customers = await CustomerService.search(query);
    res.json({ customers });
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const customer = await CustomerService.update((req.params as ParamId).id, req.body, req.userId!);
      res.json({ customer });
    } catch (e: unknown) {
      const err = e as { statusCode?: number; message?: string };
      res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const customer = await CustomerService.getById((req.params as ParamId).id);
      res.json({ customer });
    } catch (e: unknown) {
      const err = e as { statusCode?: number; message?: string };
      res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async notes(req: Request, res: Response) {
    const notes = await CustomerService.getNotesByCustomerId((req.params as ParamId).id);
    res.json({ notes });
  }
}
