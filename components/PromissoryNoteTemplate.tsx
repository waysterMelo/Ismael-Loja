import React from 'react';
import { PromissoryNote } from '../types';
import { Crown } from 'lucide-react';

interface Props {
  note: PromissoryNote;
}

export const PromissoryNoteTemplate: React.FC<Props> = ({ note }) => {
  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

  return (
    <div className="bg-white p-8 text-black font-sans relative overflow-hidden">
      {/* Minimal Header */}
      <div className="flex justify-between items-start mb-12 border-b border-black pb-6">
         <div className="flex items-center gap-4">
            <Crown size={32} className="text-black" fill="currentColor"/>
            <div>
               <h1 className="text-xl font-bold tracking-widest uppercase">IWR Moda</h1>
               <p className="text-[10px] uppercase tracking-widest text-gray-500">Nota Promissória</p>
            </div>
         </div>
         <div className="text-right">
            <span className="block text-3xl font-bold">{formatMoney(note.totalAmount)}</span>
            <span className="text-xs text-gray-400 font-mono">#{note.id}</span>
         </div>
      </div>

      {/* Legal Text - Justified, Clean */}
      <div className="mb-12 text-sm leading-8 text-justify text-gray-800">
         <p>
            Ao dia <span className="font-bold border-b border-gray-300 mx-1">{formatDate(note.dueDate)}</span>, 
            pagarei(emos) por esta única via de <strong>NOTA PROMISSÓRIA</strong> a 
            <strong> IWR MODA LTDA</strong>, a quantia de <span className="font-bold border-b border-gray-300 mx-1">{formatMoney(note.totalAmount)}</span>
            em moeda corrente deste país.
         </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-8 mb-12">
         <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Emitente</p>
            <p className="font-bold text-lg">{note.customerName}</p>
            <p className="text-sm text-gray-600">{note.customerCpf}</p>
            <p className="text-sm text-gray-600">{note.customerPhone}</p>
         </div>
         <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Referência</p>
            <ul className="text-sm text-gray-600 list-disc pl-4">
               {note.items.map((item, i) => (
                  <li key={i}>{item.quantity}x {item.description}</li>
               ))}
            </ul>
         </div>
      </div>

      {/* Footer / Signature */}
      <div className="mt-16 pt-8 border-t border-dashed border-gray-300 flex justify-between items-end">
         <div className="text-xs text-gray-400">
            <p>Emissão: {formatDate(note.issueDate)}</p>
            <p>Local: Matriz/SP</p>
         </div>
         <div className="text-center">
            <div className="w-48 border-b border-black mb-2"></div>
            <p className="text-[10px] uppercase font-bold tracking-widest">Assinatura</p>
         </div>
      </div>
    </div>
  );
};