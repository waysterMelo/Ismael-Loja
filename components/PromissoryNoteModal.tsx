import React from 'react';
import { X, Share, Printer, Check } from 'lucide-react';
import { PromissoryNote, SaleStatus } from '../types';
import { PromissoryNoteTemplate } from './PromissoryNoteTemplate';
import { storageService } from '../services/storageService';

interface PromissoryNoteModalProps {
  note: PromissoryNote | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const PromissoryNoteModal: React.FC<PromissoryNoteModalProps> = ({ note, onClose, onUpdate }) => {
  if (!note) return null;

  const handleWhatsApp = () => {
     const phone = '55' + note.customerPhone.replace(/\D/g, '');
     const msg = `Olá ${note.customerName}, segue sua nota promissória da IWR Moda no valor de R$ ${note.totalAmount}.`;
     window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePay = () => {
     storageService.updateNoteStatus(note.id, SaleStatus.PAID);
     onUpdate();
     onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-[#F2F2F7] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
           <div>
              <h3 className="font-bold text-system-text">Detalhes do Título</h3>
              <p className="text-xs text-gray-500">#{note.id}</p>
           </div>
           <button onClick={onClose} className="bg-gray-200 p-1.5 rounded-full text-gray-600 hover:bg-gray-300 transition-colors">
              <X size={18} />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
           <div className="bg-white rounded shadow-sm overflow-hidden transform scale-95 origin-top">
              <PromissoryNoteTemplate note={note} />
           </div>
        </div>

        {/* Actions Bar */}
        <div className="p-4 bg-white border-t border-gray-200 grid grid-cols-3 gap-3">
           <button onClick={() => window.print()} className="flex flex-col items-center justify-center py-2 rounded-xl text-system-blue hover:bg-blue-50 transition-colors">
              <Printer size={20} className="mb-1" />
              <span className="text-[10px] font-medium">Imprimir</span>
           </button>
           <button onClick={handleWhatsApp} className="flex flex-col items-center justify-center py-2 rounded-xl text-green-600 hover:bg-green-50 transition-colors">
              <Share size={20} className="mb-1" />
              <span className="text-[10px] font-medium">WhatsApp</span>
           </button>
           {note.status !== SaleStatus.PAID ? (
              <button onClick={handlePay} className="bg-black text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 ios-btn">
                 <Check size={16} /> Baixar Título
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