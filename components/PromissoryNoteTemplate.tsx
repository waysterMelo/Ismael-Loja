import React from 'react';
import { PromissoryNote } from '../types';
import { ShieldCheck } from 'lucide-react';

interface Props {
  note: PromissoryNote;
}

export const PromissoryNoteTemplate: React.FC<Props> = ({ note }) => {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="w-full bg-white text-gray-900 relative print:shadow-none mx-auto print:w-full print:max-w-none p-2">
      {/* Decorative Border Container - Compact Rectangular */}
      <div className="p-1.5 bg-white border border-double border-gray-300 outline outline-1 outline-luxury-black">
        <div className="border border-dashed border-gold-600/50 p-4 sm:p-6 relative">
          
          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
            <span className="text-[8vw] font-serif font-bold -rotate-12 whitespace-nowrap">IWR LOJAS</span>
          </div>

          {/* Header - More Horizontal */}
          <div className="flex justify-between items-center border-b border-luxury-black pb-4 mb-4 gap-4 relative z-10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-luxury-black text-gold-500 flex items-center justify-center rounded-lg border-2 border-gold-500 shrink-0">
                  <span className="font-serif font-bold text-xl">I</span>
               </div>
               <div>
                 <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-luxury-black uppercase leading-none">Nota Promissória</h1>
                 <p className="text-[10px] uppercase tracking-widest text-gold-700 font-bold">Via Única • Série {note.id}</p>
               </div>
            </div>
            
            <div className="text-right">
               <div className="bg-gray-100 px-3 py-1.5 rounded border border-gray-200 inline-block">
                 <p className="text-[9px] uppercase text-gray-500 font-bold tracking-wider mb-0.5">Valor do Título</p>
                 <p className="text-xl sm:text-2xl font-serif font-bold text-luxury-black leading-none">{formatMoney(note.totalAmount)}</p>
               </div>
            </div>
          </div>

          {/* Main Body - Compact Text */}
          <div className="mb-4 px-1 relative z-10">
            <p className="font-serif text-sm leading-relaxed text-justify text-gray-800">
              Ao dia <span className="font-bold border-b border-black px-1 mx-1 inline-block min-w-[80px] text-center bg-yellow-50">{formatDate(note.dueDate)}</span>, 
              pagarei(emos) por esta <strong>NOTA PROMISSÓRIA</strong> a <strong>IWR LOJAS LTDA</strong>, a quantia de 
              <span className="font-bold border-b border-black px-1 mx-1 bg-gray-100 text-luxury-black">{formatMoney(note.totalAmount)}</span>
              em moeda corrente, pagável em Loja Matriz/SP.
            </p>
          </div>

          {/* Grid Compacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-luxury-black mb-5 relative z-10 bg-white/50">
            <div className="p-3 border-b sm:border-b-0 sm:border-r border-luxury-black">
              <p className="font-bold text-[9px] uppercase tracking-wider text-gray-500 mb-1">Emitente</p>
              <p className="font-bold text-sm text-luxury-black truncate">{note.customerName}</p>
              <div className="flex gap-3 text-[10px] text-gray-600 mt-0.5">
                 <span>CPF: {note.customerCpf}</span>
                 <span>Tel: {note.customerPhone}</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50/50">
               <p className="font-bold text-[9px] uppercase tracking-wider text-gray-500 mb-1">Referente a</p>
               <div className="text-[10px] text-gray-600 line-clamp-2">
                  {note.items.map((item) => `${item.quantity}x ${item.description}`).join(', ')}
               </div>
            </div>
          </div>

          {/* Footer Compact */}
          <div className="flex flex-row justify-between items-end gap-4 relative z-10 pt-2">
             <div className="text-left">
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Data de Emissão</p>
                <p className="text-xs font-medium border-b border-gray-300 pb-0.5 pr-8 inline-block">{formatDate(note.issueDate)}</p>
             </div>

             <div className="text-center flex-1 max-w-[200px]">
                <div className="border-b border-black mb-1 h-8 w-full"></div>
                <p className="text-[9px] uppercase font-bold tracking-wider text-luxury-black">Assinatura</p>
             </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-[8px] text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-2">
             <span className="flex items-center gap-1"><ShieldCheck size={10} /> IWR Lojas System</span>
             <span>Doc. Digital</span>
          </div>

        </div>
      </div>
    </div>
  );
};