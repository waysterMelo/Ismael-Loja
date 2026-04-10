import { patch } from '../api/client';
import { SaleStatus } from '../types';
import { PromissoryNoteTemplate } from './PromissoryNoteTemplate';

interface NoteData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerCpf: string;
  items: Array<{ id: string; description: string; quantity: number; price: number }>;
  totalAmount: number;
  dueDate: string;
  issueDate: string;
  status: SaleStatus;
}

interface Props {
  note: NoteData;
  onClose: () => void;
  onUpdate: () => void;
}

const sanitizePhone = (p: string) => {
  const digits = p.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : '55' + digits;
};

export const PromissoryNoteModal: React.FC<Props> = ({ note, onClose, onUpdate }) => {
  if (!note) return null;

  const handlePay = async () => {
     try {
       await patch(`/api/promissory-notes/${note.id}/pay`, {});
       onUpdate();
       onClose();
     } catch (e) {
       console.error('Failed to pay note', e);
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#F2F2F7] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
           <div>
              <h3 className="font-bold text-gray-900">Detalhes do Título</h3>
              <p className="text-xs text-gray-500">#{note.id}</p>
           </div>
           <button onClick={onClose} className="bg-gray-200 p-1.5 rounded-full text-gray-600 hover:bg-gray-300">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" /></svg>
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
           <div className="bg-white rounded shadow-sm overflow-hidden transform scale-95 origin-top">
              <PromissoryNoteTemplate note={note} />
           </div>
        </div>
        <div className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 gap-3">
           <button onClick={() => window.print()} className="flex flex-col items-center justify-center py-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors">
              <span className="text-[10px] font-medium mb-1">Imprimir</span>
           </button>
           {note.status !== SaleStatus.PAID ? (
              <button onClick={handlePay} className="bg-black text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:bg-gray-700">
                 Baixar Título
              </button>
           ) : (
              <button disabled className="bg-gray-100 text-gray-400 rounded-xl font-bold text-sm flex items-center justify-center cursor-not-allowed">
                 Pago
              </button>
           )}
        </div>
      </div>
    </div>
  );
};
