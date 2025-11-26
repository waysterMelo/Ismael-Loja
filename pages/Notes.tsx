import React, { useState, useMemo } from 'react';
import { PromissoryNote, SaleStatus } from '../types';
import { storageService } from '../services/storageService';
import { Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Clock, MoreHorizontal, Filter, Wallet } from 'lucide-react';
import { PromissoryNoteModal } from '../components/PromissoryNoteModal';

// --- Sub-components ---

interface CalendarWidgetProps {
  notes: PromissoryNote[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ notes, selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const getDayStatus = (day: number) => {
     const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
     
     // Check for notes due on this specific day
     const hasDueNotes = notes.some(n => {
        const d = new Date(n.dueDate);
        // Compare dates ignoring time
        return d.toDateString() === dateStr && n.status !== SaleStatus.PAID;
     });

     return hasDueNotes ? 'warning' : 'none';
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-ios border border-gray-100">
       {/* Header */}
       <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-system-text capitalize">
             {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-1">
             <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-800 transition-colors">
                <ChevronLeft size={18} />
             </button>
             <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-800 transition-colors">
                <ChevronRight size={18} />
             </button>
          </div>
       </div>

       {/* Days Header */}
       <div className="grid grid-cols-7 text-center mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
             <span key={i} className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>
          ))}
       </div>

       {/* Grid */}
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
                  className={`
                     h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium transition-all relative
                     ${isSelected ? 'bg-black text-white shadow-lg' : 'hover:bg-gray-50 text-gray-700'}
                     ${isToday && !isSelected ? 'text-system-blue font-bold' : ''}
                  `}
                >
                   {day}
                   {/* Yellow Dot Indicator for Due Date */}
                   {status === 'warning' && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-yellow-400' : 'bg-yellow-500'}`}></span>
                   )}
                   {/* Yellow Background variant (alternative style) - uncomment to use full fill
                   {status === 'warning' && !isSelected && (
                      <div className="absolute inset-0 bg-yellow-100 rounded-full -z-10 border border-yellow-200"></div>
                   )} 
                   */}
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

interface NoteCardProps {
  note: PromissoryNote;
  onClick: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
   const statusConfig = {
      [SaleStatus.PAID]: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, label: 'Pago' },
      [SaleStatus.OVERDUE]: { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle, label: 'Vencido' },
      [SaleStatus.PENDING]: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pendente' },
   };

   const config = statusConfig[note.status];
   const Icon = config.icon;

   return (
      <div 
         onClick={onClick}
         className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-blue-100 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[180px]"
      >
         {/* Top Decoration */}
         <div className={`absolute top-0 left-0 w-1 h-full ${note.status === SaleStatus.OVERDUE ? 'bg-red-500' : note.status === SaleStatus.PAID ? 'bg-green-500' : 'bg-yellow-400'}`}></div>

         <div>
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-100 shadow-inner">
                     {note.customerName.charAt(0)}
                  </div>
                  <div>
                     <p className="font-bold text-system-text text-sm leading-tight group-hover:text-system-blue transition-colors line-clamp-1">{note.customerName}</p>
                     <p className="text-[11px] text-gray-400 mt-0.5">Ref #{note.id}</p>
                  </div>
               </div>
               <button className="text-gray-300 hover:text-gray-600 transition-colors">
                  <MoreHorizontal size={16} />
               </button>
            </div>

            <div className="mb-4">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Valor Total</span>
               <span className="text-2xl font-bold text-system-text tracking-tight">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(note.totalAmount)}
               </span>
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
};

// --- Main Page ---

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<PromissoryNote[]>(storageService.getNotes());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<PromissoryNote | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | SaleStatus>('ALL');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filter Logic
  const filtered = useMemo(() => {
     return notes.filter(n => {
        const matchesSearch = n.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || n.status === filterStatus;
        return matchesSearch && matchesStatus;
     }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [notes, searchTerm, filterStatus]);

  // Counts for filter pills
  const counts = useMemo(() => {
     return {
        all: notes.length,
        pending: notes.filter(n => n.status === SaleStatus.PENDING).length,
        overdue: notes.filter(n => n.status === SaleStatus.OVERDUE).length,
        paid: notes.filter(n => n.status === SaleStatus.PAID).length
     };
  }, [notes]);

  const FilterPill = ({ label, value, count, colorClass }: any) => (
     <button 
        onClick={() => setFilterStatus(value)}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2
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

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold text-system-text tracking-tight">Carteira de Títulos</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie os recebimentos e notas promissórias</p>
         </div>
         
         {/* Search Input */}
         <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
               <Search size={16} className="text-gray-400 group-focus-within:text-system-blue transition-colors" />
            </div>
            <input 
               type="text" 
               placeholder="Buscar por cliente..." 
               className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm text-sm outline-none focus:ring-2 focus:ring-system-blue/20 focus:border-system-blue/40 transition-all"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
         
         {/* Left Column: Filters + Grid */}
         <div className="flex-1 flex flex-col min-w-0">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
               <FilterPill label="Todos" value="ALL" count={counts.all} colorClass="bg-gray-100 text-gray-600" />
               <FilterPill label="Pendentes" value={SaleStatus.PENDING} count={counts.pending} colorClass="bg-yellow-100 text-yellow-700" />
               <FilterPill label="Vencidos" value={SaleStatus.OVERDUE} count={counts.overdue} colorClass="bg-red-100 text-red-600" />
               <FilterPill label="Pagos" value={SaleStatus.PAID} count={counts.paid} colorClass="bg-green-100 text-green-600" />
            </div>

            {/* Cards Grid */}
            <div className="flex-1 overflow-y-auto pr-2 pb-20">
               {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                     {filtered.map(note => (
                        <NoteCard 
                           key={note.id} 
                           note={note} 
                           onClick={() => setSelectedNote(note)} 
                        />
                     ))}
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Filter size={24} className="text-gray-400" />
                     </div>
                     <p className="text-gray-500 font-medium">Nenhum título encontrado com este filtro.</p>
                     <button onClick={() => {setFilterStatus('ALL'); setSearchTerm('')}} className="mt-2 text-system-blue text-sm font-semibold hover:underline">
                        Limpar filtros
                     </button>
                  </div>
               )}
            </div>
         </div>

         {/* Right Column: Calendar & Summary (Sticky or Fixed width) */}
         <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            
            <CalendarWidget 
               notes={notes} 
               selectedDate={selectedDate} 
               onSelectDate={setSelectedDate} 
            />

            {/* Today's Summary Widget */}
            <div className="bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden group">
               {/* Decorative Background */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5">
                        <Wallet size={20} className="text-blue-300" />
                     </div>
                     <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">A Receber Hoje</p>
                        <p className="text-sm font-semibold text-gray-200">{new Date().toLocaleDateString('pt-BR')}</p>
                     </div>
                  </div>

                  <div className="mt-2">
                     <span className="text-3xl font-bold tracking-tight">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                           notes
                              .filter(n => new Date(n.dueDate).toDateString() === new Date().toDateString() && n.status !== SaleStatus.PAID)
                              .reduce((acc, curr) => acc + curr.totalAmount, 0)
                        )}
                     </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                     <span className="text-gray-400">Títulos a vencer</span>
                     <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg border border-blue-500/30 font-bold">
                        {notes.filter(n => new Date(n.dueDate).toDateString() === new Date().toDateString() && n.status !== SaleStatus.PAID).length}
                     </span>
                  </div>
               </div>
            </div>

         </div>
      </div>

      <PromissoryNoteModal 
         note={selectedNote} 
         onClose={() => setSelectedNote(null)} 
         onUpdate={() => setNotes(storageService.getNotes())}
      />
    </div>
  );
};