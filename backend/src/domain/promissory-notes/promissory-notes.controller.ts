import { Request, Response } from 'express';
import { PromissoryNotesService } from './promissory-notes.service';
import { AuthRequest } from '../../shared/middleware';

type ParamId = { id: string };

export class PromissoryNotesController {
  static async list(req: Request, res: Response) {
    const filters: Record<string, string | Date> = {};
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.customerId) filters.customerId = req.query.customerId as string;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    const notes = await PromissoryNotesService.list(filters);
    res.json({ notes });
  }

  static async getById(req: Request, res: Response) {
    const note = await PromissoryNotesService.getById((req.params as ParamId).id);
    if (!note) {
      res.status(404).json({ error: 'Promissory note not found' });
      return;
    }
    res.json({ note });
  }

  static async pay(req: AuthRequest, res: Response) {
    await PromissoryNotesService.pay((req.params as ParamId).id, req.userId!);
    res.json({ success: true });
  }

  static async markWhatsApp(req: Request, res: Response) {
    await PromissoryNotesService.markWhatsApp((req.params as ParamId).id);
    res.json({ success: true });
  }
}
