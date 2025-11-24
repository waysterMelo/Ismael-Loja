import React from 'react';
import { X, Send, CheckCheck, Printer } from 'lucide-react';
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

  const handleChargeOnWhatsApp = () => {
    let phone = note.customerPhone.replace(/\D/g, '');
    if (!phone.startsWith('55')) phone = '55' + phone;

    const message = `Olá ${note.customerName}, aqui é da *IWR Lojas*. \n\nEstamos entrando em contato referente à sua nota promissória *#${note.id}* no valor de *${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(note.totalAmount)}* com vencimento em *${new Date(note.dueDate).toLocaleDateString('pt-BR')}*.\n\nPara facilitar, você pode efetuar o pagamento via PIX ou em nossa loja. \n\nQualquer dúvida estamos à disposição!`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    storageService.markWhatsappSent(note.id);
    onUpdate();
  };

  const handleMarkAsPaid = () => {
    if (confirm(`Confirmar recebimento do valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(note.totalAmount)}?`)) {
      storageService.updateNoteStatus(note.id, SaleStatus.PAID);
      onUpdate();
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-luxury-black/95 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Modal Structure - Adjusted for wider, shorter content */}
      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl bg-[#e5e5e5] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
        
        {/* 1. Header (Fixed) */}
        <div className="bg-luxury-charcoal text-white p-4 flex justify-between items-center shrink-0 shadow-md z-20 relative">
          <div className="flex flex-col">
             <h3 className="font-serif text-lg font-bold text-gold-500">Nota Promissória</h3>
             <p className="text-gray-400 text-xs flex items-center gap-2">
               #{note.id} • {note.customerName}
             </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-gold-500 hover:text-black transition-all hidden sm:flex"
              title="Imprimir"
            >
              <Printer size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-red-500 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-200 relative custom-scrollbar">
          {/* Padding adjusted: pt-20 ensures the top of the note is well below the header and fully visible */}
          <div className="min-h-full w-full flex flex-col items-center justify-start pt-20 pb-12 px-4 md:pt-24">
             
             {/* The Paper Document - Wider max-width */}
             <div className="w-full max-w-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] transform transition-transform">
                <PromissoryNoteTemplate note={note} />
             </div>

          </div>
        </div>

        {/* 3. Footer Actions (Fixed) */}
        <div className="bg-white p-4 border-t border-gray-200 shrink-0 z-20 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <button 
              onClick={handleChargeOnWhatsApp}
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1dbf57] text-white py-3 rounded-xl font-bold shadow-sm transition-all active:scale-[0.98]"
            >
              <Send size={18} />
              <div className="text-left leading-tight">
                 <span className="block text-[9px] uppercase tracking-wider opacity-80">Enviar</span>
                 WhatsApp
              </div>
            </button>

            {note.status !== SaleStatus.PAID ? (
              <button 
                onClick={handleMarkAsPaid}
                className="flex items-center justify-center gap-2 bg-luxury-black hover:bg-gray-800 text-gold-500 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-[0.98]"
              >
                <CheckCheck size={18} />
                <div className="text-left leading-tight">
                   <span className="block text-[9px] uppercase tracking-wider opacity-80 text-gray-400">Confirmar</span>
                   Recebimento
                </div>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-gray-100 text-gray-400 py-3 rounded-xl font-bold border-2 border-dashed border-gray-200 cursor-not-allowed">
                <CheckCheck size={18} />
                <span>Já Quitado</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};