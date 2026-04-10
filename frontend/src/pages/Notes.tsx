import { useState, useEffect, useMemo } from 'react';
import { SaleStatus } from '../types';
import { get, patch } from '../api/client';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Clock, Filter, Wallet } from 'lucide-react';
import { PromissoryNoteTemplate } from '../components/PromissoryNoteTemplate';
import { useToast } from '../context/ToastContext';

interface ApiNote {
  id: string;
  customerId: string;
  customer: { name: string; phone: string | null; cpf: string | null };
  totalAmount: number | string;
  dueDate: string;
  status: string;
  sale?: {
    items: { id: string; description: string; quantity: number; price: number | string }[];
  };
}

const CalendarWidget: React.FC<{ notes: ApiNote[]; selectedDate: Date; onSelectDate: (d: Date) => void }> = ({ notes, selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getDayStatus = (day: number) => {
     const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
     return notes.some(n => {
        const d = new Date(n.dueDate);
        return d.toDateString() === dateStr && n.status !== SaleStatus.PAID;
     }) ? 'warning' : 'none';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
       <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 capitalize">
             {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-1">
             <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-800">
                <ChevronLeft size={18} />
             </button>
             <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-800">
                <ChevronRight size={18} />
             </button>
          </div>
       </div>
       <div className="grid grid-cols-7 text-center mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <span key={i} className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>)}
       </div>
       <div className="grid grid-cols-7 gap-y-2 gap-x-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
             const day = i + 1;
             const status = getDayStatus(day);
             const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth();
             const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth();
             return (
                <button
                  key={day}
                  onClick={() => onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium transition-all relative
                     ${isSelected ? 'bg-black text-white shadow-lg' : 'hover:bg-gray-50 text-gray-700'}
                     ${isToday && !isSelected ? 'text-blue-500 font-bold' : ''}
                  `}
                >
                   {day}
                   {status === 'warning' && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-yellow-400' : 'bg-yellow-500'}`}></span>
                   )}
                </button>
             );
          })}
       </div>
       <div className="mt-6 pt-4 border-t border-dashed border-gray-100">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
             <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
             <span>Vencimento de título pendente</span>
          </div>
       </div>
    </div>
  );
};

export const Notes: React.FC = () => {
  const [allNotes, setAllNotes] = useState<ApiNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<ApiNote | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | string>('ALL');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async (dateFilter?: Date | null, statusFilter?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFilter) {
        const start = new Date(dateFilter.getFullYear(), dateFilter.getMonth(), dateFilter.getDate(), 0, 0, 0, 0);
        const end = new Date(dateFilter.getFullYear(), dateFilter.getMonth(), dateFilter.getDate(), 23, 59, 59, 999);
        params.set('startDate', start.toISOString());
        params.set('endDate', end.toISOString());
      }
      if (statusFilter && statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }
      const url = `/api/promissory-notes${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await get<{notes: ApiNote[]}>(url);
      setAllNotes(response.notes || []);
    } catch (e) {
      toast.error('Falha ao carregar carteira de títulos');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (date: Date) => {
    setSelectedDate(date);
    loadNotes(date, filterStatus);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    loadNotes(selectedDate, status);
  };

  const filtered = useMemo(() => {
     return allNotes.filter(n => {
        const matchesSearch = n.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || n.status === filterStatus;
        return matchesSearch && matchesStatus;
     }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [allNotes, searchTerm, filterStatus]);

  const counts = useMemo(() => {
     return {
        all: allNotes.length,
        pending: allNotes.filter(n => n.status === SaleStatus.PENDING).length,
        overdue: allNotes.filter(n => n.status === SaleStatus.OVERDUE).length,
        paid: allNotes.filter(n => n.status === SaleStatus.PAID).length
     };
  }, [allNotes]);

  const handlePay = async (noteId: string) => {
    try {
      await patch(`/api/promissory-notes/${noteId}/pay`, {});
      toast.success('Título baixado com sucesso');
      loadNotes();
      setSelectedNote(null);
    } catch {
      toast.error('Falha ao baixar título');
    }
  };

  const formatMoney = (val: number | string) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

  const FilterPill = ({ label, value, count, colorClass }: { label: string; value: string; count: number; colorClass: string }) => (
     <button
        onClick={() => handleStatusFilter(value)}
        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 flex-shrink-0
        ${filterStatus === value
           ? 'bg-black text-white border-black shadow-lg transform scale-105'
           : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
     >
        {label}
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filterStatus === value ? 'bg-white/20 text-white' : colorClass}`}>
           {count}
        </span>
     </button>
  );

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Carteira de Títulos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie os recebimentos e notas promissórias
              {selectedDate && (
                <span className="ml-2 text-blue-600 font-medium">
                  · Filtrado: {selectedDate.toLocaleDateString('pt-BR')}
                  <button onClick={() => { setSelectedDate(null); loadNotes(null, filterStatus); }} className="ml-2 text-red-500 hover:underline">
                    (limpar)
                  </button>
                </span>
              )}
            </p>
         </div>
         <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
               <Search size={16} className="text-gray-400" />
            </div>
            <input
               type="text"
               placeholder="Buscar por cliente..."
               className="w-full bg-white pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
         <div className="flex-1 flex flex-col min-w-0">
            <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
               <FilterPill label="Todos" value="ALL" count={counts.all} colorClass="bg-gray-100 text-gray-600" />
               <FilterPill label="Pendentes" value={SaleStatus.PENDING} count={counts.pending} colorClass="bg-yellow-100 text-yellow-700" />
               <FilterPill label="Vencidos" value={SaleStatus.OVERDUE} count={counts.overdue} colorClass="bg-red-100 text-red-600" />
               <FilterPill label="Pagos" value={SaleStatus.PAID} count={counts.paid} colorClass="bg-green-100 text-green-600" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-20">
               {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                     {filtered.map(note => {
                        const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
                           [SaleStatus.PAID]: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, label: 'Pago' },
                           [SaleStatus.OVERDUE]: { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle, label: 'Vencido' },
                           [SaleStatus.PENDING]: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pendente' },
                        };
                        const config = statusConfig[note.status] || statusConfig[SaleStatus.PENDING];
                        const Icon = config.icon;

                        return (
                           <div
                              key={note.id}
                              onClick={() => setSelectedNote(note)}
                              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-blue-100 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[180px]"
                           >
                              <div>
                                 <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-100 shadow-inner">
                                          {note.customer?.name?.charAt(0) || '?'}
                                       </div>
                                       <div>
                                          <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{note.customer?.name}</p>
                                          <p className="text-[11px] text-gray-400 mt-0.5">Ref #{note.id.slice(0, 8)}</p>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="mb-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Valor Total</span>
                                    <span className="text-2xl font-bold text-gray-900 tracking-tight">{formatMoney(note.totalAmount)}</span>
                                 </div>
                              </div>
                              <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto">
                                 <div className="text-xs text-gray-500">
                                    <span className="block text-[9px] font-bold text-gray-300 uppercase">Vencimento</span>
                                    <span className={note.status === SaleStatus.OVERDUE ? 'text-red-500 font-bold' : ''}>
                                       {new Date(note.dueDate).toLocaleDateString('pt-BR')}
                                    </span>
                                 </div>
                                 <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${config.color}`}>
                                    <Icon size={12} />
                                    {config.label}
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Filter size={24} className="text-gray-400" />
                     </div>
                     <p className="text-gray-500 font-medium">Nenhum título encontrado.</p>
                     <button onClick={() => {setFilterStatus('ALL'); setSearchTerm(''); }} className="mt-2 text-blue-600 text-sm font-semibold hover:underline">
                        Limpar filtros
                     </button>
                  </div>
               )}
            </div>
         </div>

         {/* Right Column: Calendar & Today Summary */}
         <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            <CalendarWidget
               notes={allNotes}
               selectedDate={selectedDate || new Date()}
               onSelectDate={handleDateFilter}
            />
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-xl">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5">
                     <Wallet size={20} className="text-blue-300" />
                  </div>
                  <div>
                     <p className="text-xs text-gray-400 uppercase tracking-wide">A Receber Hoje</p>
                     <p className="text-sm font-semibold text-gray-200">{new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
               </div>
               <div className="mt-2">
                  <span className="text-3xl font-bold tracking-tight">
                     {formatMoney(
                        allNotes
                           .filter(n => new Date(n.dueDate).toDateString() === new Date().toDateString() && n.status !== SaleStatus.PAID)
                           .reduce((acc, curr) => acc + Number(curr.totalAmount), 0)
                     )}
                  </span>
               </div>
               <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Títulos a vencer</span>
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg border border-blue-500/30 font-bold">
                     {allNotes.filter(n => new Date(n.dueDate).toDateString() === new Date().toDateString() && n.status !== SaleStatus.PAID).length}
                  </span>
               </div>
            </div>
         </div>
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedNote(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
               <div>
                  <h3 className="font-bold text-gray-900">Detalhes do Título</h3>
                  <p className="text-xs text-gray-500">#{selectedNote.id.slice(0, 8)}</p>
               </div>
               <button onClick={() => setSelectedNote(null)} className="bg-gray-200 p-1.5 rounded-full text-gray-600 hover:bg-gray-300">
                  <ChevronLeft size={18} />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
               <div className="rounded border overflow-hidden">
                  <PromissoryNoteTemplate note={{
                    id: selectedNote.id.slice(0, 8),
                    customerName: selectedNote.customer?.name || '',
                    customerPhone: selectedNote.customer?.phone || '',
                    customerCpf: selectedNote.customer?.cpf || '',
                    items: selectedNote.sale?.items?.map(item => ({ id: item.id, description: item.description, quantity: item.quantity, price: Number(item.price) })) || [],
                    totalAmount: Number(selectedNote.totalAmount),
                    dueDate: selectedNote.dueDate,
                    issueDate: new Date().toISOString(),
                    status: selectedNote.status as SaleStatus,
                  }} />
               </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 gap-3">
               <button onClick={() => window.open(`/print-note?id=${selectedNote.id}`, '_blank')} className="flex flex-col items-center justify-center py-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors">
                  <span className="text-[10px] font-medium mb-1">Imprimir</span>
               </button>
               {selectedNote.status !== SaleStatus.PAID ? (
                  <button onClick={() => handlePay(selectedNote.id)} className="bg-black text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:bg-gray-700">
                     <CheckCircle2 size={16} /> Baixar Título
                  </button>
               ) : (
                  <button disabled className="bg-gray-100 text-gray-400 rounded-xl font-bold text-sm flex items-center justify-center cursor-not-allowed">
                     Pago
                  </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
