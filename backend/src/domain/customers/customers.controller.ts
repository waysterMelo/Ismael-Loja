import { Request, Response } from 'express';
import { CustomerService } from './customers.service';
import { AuthRequest } from '../../shared/middleware';
import { handleError } from '../../shared/error-handler';
import { toCSV, formatDateBR } from '../../shared/csv-export';

type ParamId = { id: string };

export class CustomerController {
  static async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await CustomerService.listAll({ page, limit });
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const customer = await CustomerService.create(req.body, req.userId!);
      res.status(201).json({ customer });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const query = req.query.query as string;
      if (!query) {
        res.status(400).json({ error: 'Query parameter query is required' });
        return;
      }
      const customers = await CustomerService.search(query);
      res.json({ customers });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const customer = await CustomerService.update((req.params as ParamId).id, req.body, req.userId!);
      res.json({ customer });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const customer = await CustomerService.getById((req.params as ParamId).id);
      res.json({ customer });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async notes(req: Request, res: Response) {
    try {
      const notes = await CustomerService.getNotesByCustomerId((req.params as ParamId).id);
      res.json({ notes });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async softDelete(req: AuthRequest, res: Response) {
    try {
      const customer = await CustomerService.softDelete((req.params as ParamId).id, req.userId!);
      res.json({ customer });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async restore(req: AuthRequest, res: Response) {
    try {
      const customer = await CustomerService.restore((req.params as ParamId).id, req.userId!);
      res.json({ customer });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async exportCSV(req: Request, res: Response) {
    try {
      const customers = await CustomerService.listAll({ page: 1, limit: 10000 });
      
      const csvData = customers.data.map(c => ({
        Nome: c.name,
        CPF: c.cpf || '',
        Telefone: c.phone || '',
        Email: c.email || '',
        Endereço: c.address || '',
        VIP: c.isVip ? 'Sim' : 'Não',
        'Data Cadastro': formatDateBR(c.createdAt),
      }));

      const csv = toCSV(csvData, Object.keys(csvData[0] || {}));
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=clientes.csv');
      res.send('\ufeff' + csv); // BOM para UTF-8
    } catch (error) {
      handleError(res, error);
    }
  }
}
