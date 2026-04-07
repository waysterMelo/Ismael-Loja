import { prisma } from '../../shared/prisma';
import { SaleStatus } from '@prisma/client';

export class OverdueJobService {
  /**
   * Marca todos os títulos pendentes com data de vencimento passada como OVERDUE.
   * Pode ser chamado via endpoint ou script externo.
   */
  static async markOverdue(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Busca todos os títulos pendentes vencidos
    const overdueNotes = await prisma.promissoryNote.findMany({
      where: {
        status: SaleStatus.PENDING,
        dueDate: { lt: today },
      },
      select: { id: true },
    });

    if (overdueNotes.length === 0) {
      return 0;
    }

    // Atualiza em batch
    const ids = overdueNotes.map(n => n.id);
    await prisma.promissoryNote.updateMany({
      where: { id: { in: ids } },
      data: { status: SaleStatus.OVERDUE },
    });

    return ids.length;
  }
}
