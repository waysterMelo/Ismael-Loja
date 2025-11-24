import React, { useState, useMemo } from 'react';
import { PromissoryNote, SaleStatus } from '../types';
import { storageService } from '../services/storageService';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  FilterX,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical
} from 'lucide-react';
import { PromissoryNoteModal } from '../components/PromissoryNoteModal';

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<PromissoryNote[]>(storageService.getNotes());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SaleStatus>('ALL');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedNote, setSelectedNote] = useState<PromissoryNote | null>(null);
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const refreshData = () => {
      setNotes(storageService.getNotes());
  };

  // --- CALENDAR LOGIC ---
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const dueDatesMap = useMemo(() => {
    const map = new Set<string>();
    notes.forEach(note => {
        if (note.status !== SaleStatus.PAID) {
            const dateStr = new Date(note.dueDate).toDateString();
            map.add(dateStr);
        }
    });
    return map;
  }, [notes]);

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (selectedDate && newDate.toDateString() === selectedDate.toDateString()) {
        setSelectedDate(null); // Toggle off
    } else {
        setSelectedDate(newDate);
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  // --- FILTER LOGIC ---
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || n.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || n.status === statusFilter;
    
    let matchesDate = true;
    if (selectedDate) {
        matchesDate = new Date(n.dueDate).toDateString() === selectedDate.toDateString();
    }

    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Helper for Status UI
  const getStatusConfig = (status: SaleStatus) => {
      switch (status) {
          case SaleStatus.OVERDUE: return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-500', label: 'Atrasado', icon: AlertCircle };
          case SaleStatus.PAID: return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-500', label: 'Pago', icon: CheckCircle2 };
          default: return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-gold-500', label: 'Pendente', icon: Clock };
      }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10 animate-fade-in-up">
      
      {/* LEFT COLUMN: LIST & FILTERS */}
      <div className="flex-1 space-y-6">
        
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-serif font-bold text-luxury-black">Carteira de Títulos</h2>
                <p className="text-sm text-gray-500">Gerencie recebimentos e cobranças</p>
            </div>
            
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar cliente ou ID..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 outline-none focus:border-gold-500 text-sm transition-all shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
                { id: 'ALL', label: 'Todos' },
                { id: SaleStatus.PENDING, label: 'Pendentes' },
                { id: SaleStatus.OVERDUE, label: 'Atrasados' },
                { id: SaleStatus.PAID, label: 'Pagos' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        statusFilter === tab.id 
                        ? 'bg-luxury-black text-gold-500 shadow-lg scale-105' 
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Date Filter Badge (if active) */}
        {selectedDate && (
            <div className="flex items-center gap-2 bg-gold-100 text-gold-800 px-4 py-2 rounded-lg w-fit text-sm font-bold animate-fade-in-up">
                <CalendarIcon size={16} />
                Filtrando por: {selectedDate.toLocaleDateString('pt-BR')}
                <button onClick={() => setSelectedDate(null)} className="ml-2 hover:text-red-500"><FilterX size={16}/></button>
            </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-gray-300" size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">Nenhum título encontrado.</p>
                    <button onClick={() => {setSearchTerm(''); setStatusFilter('ALL'); setSelectedDate(null);}} className="mt-2 text-sm text-gold-600 font-bold hover:underline">Limpar filtros</button>
                </div>
            ) : (
                filteredNotes.map((note) => {
                    const statusCfg = getStatusConfig(note.status);
                    const StatusIcon = statusCfg.icon;
                    
                    return (
                        <div 
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            className="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                        >
                            {/* Status Stripe Left */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusCfg.bg.replace('50', '500')}`}></div>
                            
                            <div className="flex justify-between items-start mb-3 pl-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border} flex items-center gap-1`}>
                                            <StatusIcon size={10} /> {statusCfg.label}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-mono">#{note.id}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-gold-600 transition-colors">{note.customerName}</h3>
                                </div>
                                <div className="p-2 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-600 transition-colors">
                                    <MoreVertical size={16} />
                                </div>
                            </div>

                            <div className="flex justify-between items-end pl-2 mt-4 pt-4 border-t border-gray-50">
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Vencimento</p>
                                    <div className="flex items-center gap-1.5 text-gray-600 font-medium text-sm">
                                        <CalendarIcon size={14} className={note.status === SaleStatus.OVERDUE ? 'text-red-500' : 'text-gray-400'} />
                                        <span className={note.status === SaleStatus.OVERDUE ? 'text-red-600 font-bold' : ''}>
                                            {new Date(note.dueDate).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Valor Total</p>
                                    <p className="text-xl font-serif font-bold text-luxury-black">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(note.totalAmount)}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Hover Action hint */}
                            <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                    );
                })
            )}
        </div>
      </div>

      {/* RIGHT COLUMN: CALENDAR SIDEBAR */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
         
         {/* Calendar Widget */}
         <div className="bg-white rounded-3xl p-6 shadow-glass border border-white/60">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif font-bold text-lg text-luxury-black capitalize">
                    {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-1">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronLeft size={20}/></button>
                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronRight size={20}/></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['D','S','T','Q','Q','S','S'].map((d, i) => (
                    <div key={i} className="text-xs font-bold text-gray-300">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dateStr = date.toDateString();
                    const hasNote = dueDatesMap.has(dateStr);
                    const isSelected = selectedDate?.toDateString() === dateStr;
                    const isToday = new Date().toDateString() === dateStr;

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            disabled={!hasNote && !isSelected}
                            className={`
                                aspect-square rounded-lg flex items-center justify-center text-sm relative transition-all
                                ${isSelected 
                                    ? 'bg-luxury-black text-gold-500 shadow-lg font-bold scale-110 z-10' 
                                    : hasNote 
                                        ? 'bg-gold-400 text-luxury-charcoal font-bold hover:brightness-110 shadow-sm' 
                                        : 'text-gray-400 hover:bg-gray-50'
                                }
                                ${!hasNote && !isSelected && 'opacity-50 cursor-default'}
                                ${isToday && !isSelected && 'ring-1 ring-gold-500'}
                            `}
                        >
                            {day}
                            {hasNote && !isSelected && (
                                <span className="absolute bottom-1 w-1 h-1 bg-luxury-black rounded-full opacity-50"></span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="w-3 h-3 rounded bg-gold-400"></span> Dias com vencimentos
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded bg-luxury-black"></span> Data selecionada
                </div>
            </div>
         </div>

         {/* Mini Stats Summary */}
         <div className="bg-luxury-charcoal text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                 <h4 className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-4">Resumo do Mês</h4>
                 <div className="space-y-4">
                     <div className="flex justify-between items-center border-b border-white/10 pb-2">
                         <span className="text-sm text-gray-400">A receber</span>
                         <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(notes.filter(n => n.status === SaleStatus.PENDING).reduce((acc, n) => acc + n.totalAmount, 0))}</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-white/10 pb-2">
                         <span className="text-sm text-red-400">Em atraso</span>
                         <span className="font-bold text-red-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(notes.filter(n => n.status === SaleStatus.OVERDUE).reduce((acc, n) => acc + n.totalAmount, 0))}</span>
                     </div>
                 </div>
                 <button onClick={() => { setStatusFilter(SaleStatus.OVERDUE); setSelectedDate(null); }} className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors backdrop-blur-sm">
                     Ver inadimplentes
                 </button>
             </div>
             {/* Decor */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500 rounded-full blur-[60px] opacity-10"></div>
         </div>

      </div>

      <PromissoryNoteModal 
         note={selectedNote} 
         onClose={() => setSelectedNote(null)} 
         onUpdate={refreshData} 
      />
    </div>
  );
};