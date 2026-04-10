import { Request, Response } from 'express';
import { PromissoryNotesService } from './promissory-notes.service';
import { AuthRequest } from '../../shared/middleware';
import { handleError } from '../../shared/error-handler';
import { toCSV, formatDateBR, formatCurrencyBRL } from '../../shared/csv-export';

type ParamId = { id: string };

interface NoteCSVData {
  Cliente: string;
  CPF: string;
  'Valor Total': string;
  'Data Emissão': string;
  'Data Vencimento': string;
  Status: string;
  'Data Pagamento': string;
}

export class PromissoryNotesController {
  static async list(req: Request, res: Response) {
    try {
      const filters: Record<string, string | Date> = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.customerId) filters.customerId = req.query.customerId as string;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await PromissoryNotesService.list(filters, { page, limit });
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const note = await PromissoryNotesService.getById((req.params as ParamId).id);
      if (!note) {
        res.status(404).json({ error: 'Promissory note not found' });
        return;
      }
      res.json({ note });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async pay(req: AuthRequest, res: Response) {
    try {
      await PromissoryNotesService.pay((req.params as ParamId).id, req.userId!);
      res.json({ success: true });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async exportCSV(req: Request, res: Response) {
    try {
      const filters: Record<string, string | Date> = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.customerId) filters.customerId = req.query.customerId as string;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const notes = await PromissoryNotesService.list(filters, { page: 1, limit: 10000 });
      
      const statusLabels: Record<string, string> = { PENDING: 'Pendente', PAID: 'Pago', OVERDUE: 'Vencido' };
      
      const csvData: NoteCSVData[] = notes.data.map((n) => ({
        Cliente: n.customer?.name || '',
        CPF: n.customer?.cpf || '',
        'Valor Total': formatCurrencyBRL(n.totalAmount.toString()),
        'Data Emissão': formatDateBR(n.createdAt),
        'Data Vencimento': formatDateBR(n.dueDate),
        Status: statusLabels[n.status] || n.status,
        'Data Pagamento': n.paidAt ? formatDateBR(n.paidAt) : '',
      }));

      const csv = toCSV(csvData as unknown as Record<string, unknown>[], Object.keys(csvData[0] || {}));
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=titulos.csv');
      res.send('\ufeff' + csv);
    } catch (error) {
      handleError(res, error);
    }
  }
}
