import React, { useMemo, useState } from 'react';
import { PromissoryNote, SaleStatus } from '../types';
import { storageService } from '../services/storageService';
import { 
  ArrowUpRight, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { PromissoryNoteModal } from '../components/PromissoryNoteModal';

export const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<PromissoryNote[]>(storageService.getNotes());
  const [customers] = useState(storageService.getCustomers());
  const [viewNote, setViewNote] = useState<PromissoryNote | null>(null);

  const stats = useMemo(() => {
    const totalRevenue = notes.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const pendingAmount = notes.filter(n => n.status !== SaleStatus.PAID).reduce((acc, curr) => acc + curr.totalAmount, 0);
    const overdueNotes = notes.filter(n => n.status === SaleStatus.OVERDUE);
    
    return { totalRevenue, pendingAmount, overdueNotes, customerCount: customers.length };
  }, [notes, customers]);

  const urgentNotes = notes
    .filter(n => n.status === SaleStatus.OVERDUE || new Date(n.dueDate) <= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const refreshData = () => {
     setNotes(storageService.getNotes());
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up stagger-1">
        
        {/* Stat Card 1 */}
        <div className="bg-white rounded-3xl p-6 shadow-glass border border-white/50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
             <DollarSign size={48} className="text-luxury-black" />
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Recebíveis Totais</p>
          <h3 className="text-2xl font-serif font-bold text-gray-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.pendingAmount)}
          </h3>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded-full">
            <TrendingUp size={14} className="mr-1" /> +12% vs mês anterior
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-luxury-charcoal rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 text-white">
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold-500 rounded-full blur-[40px] opacity-20"></div>
          <div className="flex justify-between items-start">
             <div>
                <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-2">Clientes Ativos</p>
                <h3 className="text-2xl font-serif font-bold text-white">{stats.customerCount}</h3>
             </div>
             <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                <Users size={20} className="text-gold-400" />
             </div>
          </div>
          <p className="mt-6 text-xs text-gray-400">Base de clientes VIP crescendo.</p>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-3xl p-6 shadow-glass border border-white/50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2">Atenção</p>
                <h3 className="text-2xl font-serif font-bold text-gray-800">{stats.overdueNotes.length} <span className="text-sm font-sans font-normal text-gray-400">títulos</span></h3>
             </div>
             <div className="bg-red-50 p-2 rounded-xl">
                <AlertCircle size={20} className="text-red-500" />
             </div>
          </div>
          <p className="mt-6 text-xs text-gray-500">Notas vencidas requerem ação imediata.</p>
        </div>

        {/* Stat Card 4 - Action */}
        <div className="bg-gold-gradient rounded-3xl p-6 shadow-glow relative overflow-hidden group cursor-pointer hover:brightness-105 transition-all">
          <div className="h-full flex flex-col justify-between relative z-10">
             <div className="flex justify-between items-start text-luxury-black">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Acesso Rápido</p>
                <ArrowUpRight size={20} />
             </div>
             <div>
                <h3 className="text-xl font-serif font-bold text-luxury-black leading-tight mb-1">Agendar Cobranças</h3>
                <p className="text-xs text-luxury-black/70">Enviar lembretes WhatsApp para hoje.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up stagger-2">
        
        {/* Main Section: Urgent Timeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-glass border border-white/60 p-8">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-xl font-serif font-bold text-gray-800">Prioridades Financeiras</h3>
                 <p className="text-sm text-gray-400">Próximos vencimentos e atrasos</p>
              </div>
              <button className="text-xs font-bold text-gold-600 hover:text-gold-700 uppercase tracking-wider">Ver Calendário</button>
           </div>

           <div className="space-y-4">
              {urgentNotes.length === 0 ? (
                 <div className="p-8 text-center bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                    <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                    <p className="text-gray-500 font-medium">Tudo em dia. Excelente gestão!</p>
                 </div>
              ) : (
                urgentNotes.map((note) => (
                   <div key={note.id} onClick={() => setViewNote(note)} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                      {/* Date Badge */}
                      <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl font-bold text-sm shadow-sm ${
                          note.status === SaleStatus.OVERDUE ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'
                      }`}>
                         <span className="text-xs uppercase">{new Date(note.dueDate).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                         <span className="text-lg">{new Date(note.dueDate).getDate()}</span>
                      </div>

                      <div className="flex-1">
                         <div className="flex justify-between">
                            <h4 className="font-bold text-gray-800 group-hover:text-gold-600 transition-colors">{note.customerName}</h4>
                            <span className="font-mono font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(note.totalAmount)}</span>
                         </div>
                         <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500 line-clamp-1">{note.items.map(i => i.description).join(', ')}</p>
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                                {note.status === SaleStatus.OVERDUE && <span className="text-red-500">Vencido</span>}
                                {note.whatsappSent && <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={10}/> WhatsApp Enviado</span>}
                            </div>
                         </div>
                      </div>
                      
                      <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-luxury-black transition-all">
                         <ChevronRight size={20} />
                      </button>
                   </div>
                ))
              )}
           </div>
        </div>

        {/* Side Widget: Quick Actions / Activity */}
        <div className="space-y-6">
           <div className="bg-luxury-charcoal text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Clock className="text-gold-400" />
                 </div>
                 <h4 className="text-2xl font-serif font-bold mb-2">Abertura de Caixa</h4>
                 <p className="text-gray-400 text-sm mb-6">O caixa de hoje ainda não foi fechado. Registre as operações antes de encerrar.</p>
                 <button className="w-full py-3 rounded-xl bg-white text-luxury-black font-bold text-sm hover:bg-gray-100 transition-colors">
                    Gerenciar Caixa
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-3xl shadow-glass border border-white/60 p-6">
              <h4 className="font-serif font-bold text-gray-800 mb-4">Atividade Recente</h4>
              <div className="space-y-6 relative before:absolute before:left-[19px] before:top-10 before:bottom-0 before:w-px before:bg-gray-200">
                 {[1,2,3].map((_, i) => (
                    <div key={i} className="flex gap-4 relative">
                       <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shrink-0 z-10">
                          <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                       </div>
                       <div>
                          <p className="text-sm font-medium text-gray-800">Pagamento recebido</p>
                          <p className="text-xs text-gray-500">Ana Pereira - R$ 450,00</p>
                          <p className="text-[10px] text-gray-400 mt-1">Há 2 horas</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* New Modal Implementation */}
      <PromissoryNoteModal 
         note={viewNote} 
         onClose={() => setViewNote(null)} 
         onUpdate={refreshData}
      />

    </div>
  );
};