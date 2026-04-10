import { SaleStatus, Prisma } from '@prisma/client';
import { paginate, PaginationParams } from '../../shared/pagination';
import { PromissoryNoteRepository } from './promissory-notes.repository';

export class PromissoryNotesService {
  static async list(filters: { status?: string; customerId?: string; startDate?: Date; endDate?: Date }, pagination: PaginationParams) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.PromissoryNoteWhereInput = {};

    if (filters.status) {
      where.status = filters.status as SaleStatus;
    }
    if (filters.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters.startDate || filters.endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filters.startDate) {
        dateFilter.gte = filters.startDate;
      }
      if (filters.endDate) {
        dateFilter.lte = filters.endDate;
      }
      where.dueDate = dateFilter;
    }

    const [allNotes, total] = await Promise.all([
      PromissoryNoteRepository.findMany(where, skip, limit),
      PromissoryNoteRepository.count(where),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notes = allNotes.map((note) => {
      const dueDate = new Date(note.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (note.status !== SaleStatus.PAID && dueDate < today) {
        if (note.status === SaleStatus.PENDING) {
          return { ...note, status: SaleStatus.OVERDUE };
        }
      }
      return note;
    });

    // Atualizar status vencidos em background (sem bloquear resposta)
    const overdueNotes = notes.filter(n => n.status === SaleStatus.OVERDUE && n.id);
    if (overdueNotes.length > 0) {
      PromissoryNotesService._markOverdueBatch(overdueNotes.map(n => n.id)).catch(() => {});
    }

    return {
      data: notes,
      pagination: paginate({ page, limit }, total),
    };
  }

  // Método interno para atualizar status vencidos em lote
  private static async _markOverdueBatch(ids: string[]) {
    if (ids.length === 0) return;
    await PromissoryNoteRepository.updateManyStatus(ids, SaleStatus.OVERDUE).catch(() => {});
  }

  static async getById(id: string) {
    return PromissoryNoteRepository.findById(id);
  }

  static async pay(id: string, userId: string) {
    const result = await PromissoryNoteRepository.pay(id, userId);

    return result;
  }

}
