import { SaleStatus } from '@prisma/client';
import { PromissoryNoteRepository } from './promissory-notes.repository';

export class OverdueJobService {
  /**
   * Marca todos os títulos pendentes com data de vencimento passada como OVERDUE.
   * Pode ser chamado via endpoint ou script externo.
   */
  static async markOverdue(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Busca todos os títulos pendentes vencidos
    const ids = await PromissoryNoteRepository.findPendingOverdueIds(today);

    if (ids.length === 0) {
      return 0;
    }

    // Atualiza em batch
    await PromissoryNoteRepository.updateManyStatus(ids, SaleStatus.OVERDUE);

    return ids.length;
  }
}
