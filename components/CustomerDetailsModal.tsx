import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Customer, SaleStatus, PromissoryNote } from '../types';
import { storageService } from '../services/storageService';
import { X, Phone, MapPin, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, MessageCircle, Mail, Package, CreditCard, ArrowUpRight } from 'lucide-react';

interface Props {
  customer: Customer | null;
  onClose: () => void;
}

export const CustomerDetailsModal: React.FC<Props> = ({ customer, onClose }) => {
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const history = useMemo(() => customer ? storageService.getNotesByCustomerId(customer.id) : [], [customer]);

  // Calculations for the mini-dashboard
  const stats = useMemo(() => {
    const totalSpent = history.reduce((acc, note) => acc + note.totalAmount, 0);
    const openDebt = history
      .filter(n => n.status !== SaleStatus.PAID)
      .reduce((acc, note) => acc + note.totalAmount, 0);
    const avgTicket = history.length > 0 ? totalSpent / history.length : 0;
    
    return { totalSpent, openDebt, avgTicket };
  }, [history]);

  if (!customer) return null;

  const toggleNote = (id: string) => {
    setExpandedNoteId(expandedNoteId === id ? null : id);
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getStatusStyle = (status: SaleStatus) => {
     switch(status) {
        case SaleStatus.PAID: return 'bg-green-100 text-green-700 border-green-200';
        case SaleStatus.OVERDUE: return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-amber-100 text-amber-700 border-amber-200';
     }
  };

  const getStatusIcon = (status: SaleStatus) => {
     switch(status) {
        case SaleStatus.PAID: return <CheckCircle size={14} className="mr-1"/>;
        case SaleStatus.OVERDUE: return <AlertTriangle size={14} className="mr-1"/>;
        default: return <Clock size={14} className="mr-1"/>;
     }
  };

  const handleWhatsApp = () => {
     const phone = '55' + customer.phone.replace(/\D/g, '');
     window.open(`https://wa.me/${phone}`, '_blank');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />
      
      {/* Reduced Max Width (5xl -> 4xl/5xl) and Height (95vh -> 85vh) */}
      <div className="bg-[#F5F5F7] w-full max-w-5xl h-[90vh] sm:h-[85vh] sm:rounded-[28px] rounded-t-[28px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up relative z-10 sm:border border-white/40 ring-1 ring-black/5">
         
         {/* Left Panel: Profile & Actions (Compact Version) */}
         <div className="w-full md:w-[280px] lg:w-[300px] bg-white border-r border-gray-200 flex flex-col relative z-20 shrink-0">
            {/* Header / Cover - Reduced Height */}
            <div className="h-24 bg-gradient-to-b from-gray-50 to-white relative">
               <button onClick={onClose} className="absolute top-4 left-4 p-2 rounded-full bg-white/50 hover:bg-gray-100 transition-colors md:hidden z-30">
                  <X size={20} />
               </button>
               {customer.isVip && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-20">
                     <span>VIP</span>
                  </div>
               )}
            </div>

            {/* Profile Info - Compact */}
            <div className="px-6 -mt-12 flex flex-col items-center text-center pb-6 border-b border-gray-100">
               <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg mb-3 relative z-10">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-3xl font-bold text-white shadow-inner overflow-hidden`}>
                     {customer.name.charAt(0)}
                  </div>
               </div>
               <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-tight px-2">{customer.name}</h2>
               <p className="text-xs text-gray-500 mt-1">{customer.email || 'Sem e-mail'}</p>
               
               {/* Action Buttons - Compact */}
               <div className="flex items-center gap-4 mt-5 w-full justify-center">
                  <button onClick={handleWhatsApp} className="flex flex-col items-center gap-1.5 group">
                     <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                        <MessageCircle size={18} fill="currentColor" className="text-white" />
                     </div>
                     <span className="text-[10px] font-medium text-green-600">WhatsApp</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5 group">
                     <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                        <Phone size={18} fill="currentColor" />
                     </div>
                     <span className="text-[10px] font-medium text-blue-600">Ligar</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5 group">
                     <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shadow-sm group-hover:bg-gray-200 transition-colors">
                        <Mail size={18} />
                     </div>
                     <span className="text-[10px] font-medium text-gray-500">Email</span>
                  </button>
               </div>
            </div>

            {/* Details List */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
               <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                     <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <CreditCard size={15} />
                     </div>
                     <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">CPF</p>
                        <p className="text-xs font-semibold text-gray-800 truncate">{customer.cpf}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                     <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <MapPin size={15} />
                     </div>
                     <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Endereço</p>
                        <p className="text-xs font-semibold text-gray-800 truncate">{customer.address || 'Não informado'}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                     <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <Calendar size={15} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cliente desde</p>
                        <p className="text-xs font-semibold text-gray-800">{new Date(customer.createdAt).toLocaleDateString('pt-BR')}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Panel: History & Stats */}
         <div className="flex-1 flex flex-col min-h-0 bg-[#F5F5F7] relative">
            {/* Right Panel Header - Reduced Height */}
            <div className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-20 shrink-0">
               <h3 className="text-lg font-bold text-gray-900 tracking-tight">Histórico Financeiro</h3>
               <button onClick={onClose} className="hidden md:flex bg-gray-200/50 p-1.5 rounded-full text-gray-500 hover:bg-gray-300 transition-colors">
                  <X size={16} />
               </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
               
               {/* Stats Grid (Compact) */}
               <div className="p-5 pb-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24 hover:scale-[1.01] transition-transform duration-300">
                        <div className="flex items-center gap-2 text-gray-500">
                           <div className="p-1 bg-blue-50 text-blue-500 rounded"><CreditCard size={12}/></div>
                           <span className="text-[10px] font-bold uppercase tracking-wide">Total Gasto</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 tracking-tight">{formatMoney(stats.totalSpent)}</p>
                     </div>

                     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24 relative overflow-hidden hover:scale-[1.01] transition-transform duration-300">
                        {stats.openDebt > 0 && <div className="absolute right-0 top-0 w-12 h-12 bg-red-50 rounded-bl-full -mr-6 -mt-6"></div>}
                        <div className="flex items-center gap-2 text-gray-500 relative z-10">
                           <div className={`p-1 rounded ${stats.openDebt > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                              {stats.openDebt > 0 ? <AlertTriangle size={12}/> : <CheckCircle size={12}/>}
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-wide">Em Aberto</span>
                        </div>
                        <div>
                           <p className={`text-xl font-bold tracking-tight ${stats.openDebt > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                              {formatMoney(stats.openDebt)}
                           </p>
                           {stats.openDebt > 0 && <p className="text-[9px] text-red-400 font-bold mt-0.5">ATENÇÃO REQUERIDA</p>}
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24 hover:scale-[1.01] transition-transform duration-300">
                        <div className="flex items-center gap-2 text-gray-500">
                            <div className="p-1 bg-purple-50 text-purple-500 rounded"><TrendingUp size={12}/></div>
                           <span className="text-[10px] font-bold uppercase tracking-wide">Ticket Médio</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 tracking-tight">{formatMoney(stats.avgTicket)}</p>
                     </div>
                  </div>
               </div>

               {/* Timeline List - Sticky Header Section */}
               <div className="relative">
                  <div className="sticky top-0 z-10 bg-[#F5F5F7]/95 backdrop-blur-sm border-b border-gray-200/50 px-6 py-2.5 mb-2 flex items-center">
                     <Clock size={12} className="text-gray-400 mr-2" />
                     <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transações Recentes</h4>
                  </div>
                  
                  <div className="px-5 pb-6 space-y-2.5">
                     {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                           <Package size={32} className="mb-2 opacity-20 stroke-1"/>
                           <p className="text-xs font-medium">Nenhuma compra registrada</p>
                        </div>
                     ) : (
                        history.map(note => {
                           const isExpanded = expandedNoteId === note.id;
                           return (
                              <div key={note.id} className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'shadow-md ring-1 ring-blue-100 border-blue-200' : 'shadow-sm border-gray-100 hover:border-gray-300'}`}>
                                 {/* Card Header (Clickable) - More compact padding */}
                                 <div 
                                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    onClick={() => toggleNote(note.id)}
                                 >
                                    <div className="flex items-center gap-3.5">
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shadow-sm border border-white shrink-0
                                          ${note.status === 'PAID' ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-600' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500'}`}>
                                          <Package size={18} />
                                       </div>
                                       <div>
                                          <h5 className="font-bold text-gray-900 text-sm">#{note.id}</h5>
                                          <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                             {new Date(note.issueDate).toLocaleDateString('pt-BR')} • {note.items.length} itens
                                          </p>
                                       </div>
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-4">
                                       <div className="text-right hidden sm:block">
                                          <span className="block font-bold text-sm text-gray-900">{formatMoney(note.totalAmount)}</span>
                                       </div>
                                       <div className={`flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(note.status)}`}>
                                          {getStatusIcon(note.status)}
                                          {note.status === 'PAID' ? 'PAGO' : note.status === 'OVERDUE' ? 'VENCIDO' : 'PENDENTE'}
                                       </div>
                                       <div className={`text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                          <ChevronDown size={16} />
                                       </div>
                                    </div>
                                 </div>

                                 {/* Expanded Content (Items) */}
                                 <div className={`bg-gray-50/50 border-t border-gray-100 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-4">
                                       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                          <table className="w-full text-xs text-left">
                                             <thead className="bg-gray-50">
                                                <tr className="text-gray-400 uppercase border-b border-gray-100">
                                                   <th className="px-3 py-2 font-semibold">Item</th>
                                                   <th className="px-3 py-2 font-semibold text-center w-16">Qtd</th>
                                                   <th className="px-3 py-2 font-semibold text-right w-24">Preço</th>
                                                </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-100">
                                                {note.items.map((item, idx) => (
                                                   <tr key={idx} className="group hover:bg-blue-50/30 transition-colors">
                                                      <td className="px-3 py-2 font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{item.description}</td>
                                                      <td className="px-3 py-2 text-center text-gray-500">{item.quantity}</td>
                                                      <td className="px-3 py-2 text-right text-gray-900 font-semibold">{formatMoney(item.price)}</td>
                                                   </tr>
                                                ))}
                                             </tbody>
                                             <tfoot className="bg-gray-50/50 border-t border-gray-100">
                                                <tr>
                                                   <td colSpan={2} className="px-3 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Total</td>
                                                   <td className="px-3 py-2 text-right font-bold text-sm text-gray-900">{formatMoney(note.totalAmount)}</td>
                                                </tr>
                                             </tfoot>
                                          </table>
                                       </div>
                                       
                                       <div className="mt-3 flex justify-end">
                                          <button className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline bg-blue-50 px-2.5 py-1 rounded-md transition-colors">
                                             Ver Documento <ArrowUpRight size={10}/>
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           );
                        })
                     )}
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>,
    document.body
  );
};
