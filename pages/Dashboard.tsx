import React, { useMemo } from 'react';
import { storageService } from '../services/storageService';
import { SaleStatus } from '../types';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Clock, Plus } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const notes = storageService.getNotes();
  const customers = storageService.getCustomers();

  const stats = useMemo(() => {
    const pending = notes.filter(n => n.status !== SaleStatus.PAID).reduce((acc, curr) => acc + curr.totalAmount, 0);
    const overdue = notes.filter(n => n.status === SaleStatus.OVERDUE);
    const monthSales = notes.reduce((acc, curr) => acc + curr.totalAmount, 0);
    return { pending, overdueCount: overdue.length, monthSales, customerCount: customers.length };
  }, [notes, customers]);

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-12">
      
      {/* Editorial Header */}
      <div className="flex items-end justify-between border-b border-atelier-black pb-6">
         <div>
            <span className="text-xs font-mono uppercase tracking-widest text-atelier-secondary block mb-2">Visão Geral • {new Date().getFullYear()}</span>
            <h1 className="text-5xl md:text-6xl font-serif font-medium text-atelier-black leading-[0.9]">
               Performance <br/> <span className="italic text-atelier-secondary">do Atelier</span>
            </h1>
         </div>
         <button className="bg-atelier-black text-white px-8 py-4 rounded-none font-medium tracking-wide hover:bg-atelier-accent transition-colors flex items-center gap-3">
            <Plus size={18} /> Nova Venda
         </button>
      </div>

      {/* KPI Section - Minimalist Typography */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-atelier-line border border-atelier-line">
         
         {/* Card 1 */}
         <div className="bg-atelier-bg p-8 hover:bg-white transition-colors duration-500 group relative overflow-hidden">
            <div className="flex justify-between items-start mb-12">
               <span className="text-xs font-bold uppercase tracking-widest text-atelier-secondary">Receita Pendente</span>
               <ArrowUpRight size={20} className="text-atelier-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
            <div className="relative z-10">
               <span className="text-4xl md:text-5xl font-serif text-atelier-black block mb-2">{formatMoney(stats.pending)}</span>
               <div className="flex items-center gap-2 text-xs text-green-600 font-mono">
                  <TrendingUp size={12} />
                  <span>+12% vs mês anterior</span>
               </div>
            </div>
         </div>

         {/* Card 2 */}
         <div className="bg-atelier-bg p-8 hover:bg-white transition-colors duration-500 group">
            <div className="flex justify-between items-start mb-12">
               <span className="text-xs font-bold uppercase tracking-widest text-atelier-secondary">Títulos Vencidos</span>
               <span className="w-2 h-2 rounded-full bg-red-500"></span>
            </div>
            <div>
               <span className="text-4xl md:text-5xl font-serif text-atelier-black block mb-2">{stats.overdueCount}</span>
               <span className="text-xs text-atelier-secondary font-mono">Ação necessária imediata</span>
            </div>
         </div>

         {/* Card 3 */}
         <div className="bg-atelier-bg p-8 hover:bg-white transition-colors duration-500 group">
            <div className="flex justify-between items-start mb-12">
               <span className="text-xs font-bold uppercase tracking-widest text-atelier-secondary">Base de Clientes</span>
               <ArrowUpRight size={20} className="text-atelier-black opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
               <span className="text-4xl md:text-5xl font-serif text-atelier-black block mb-2">{stats.customerCount}</span>
               <span className="text-xs text-atelier-secondary font-mono">Clientes ativos no sistema</span>
            </div>
         </div>
      </div>

      {/* Recent Activity - Magazine List Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         
         <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-serif text-2xl text-atelier-black italic">Últimas Movimentações</h3>
               <button className="text-xs font-bold uppercase tracking-widest text-atelier-black border-b border-atelier-black pb-0.5 hover:opacity-70 transition-opacity">Ver Tudo</button>
            </div>
            
            <div className="space-y-4">
               {notes.slice(0, 4).map((note) => (
                  <div key={note.id} className="group flex items-center justify-between py-6 border-b border-atelier-line hover:border-atelier-black transition-colors cursor-pointer">
                     <div className="flex items-center gap-6">
                        <span className="font-mono text-xs text-atelier-secondary">0{note.id}</span>
                        <div>
                           <p className="font-medium text-lg text-atelier-black group-hover:translate-x-2 transition-transform duration-300">{note.customerName}</p>
                           <p className="text-xs text-atelier-secondary mt-1">{new Date(note.issueDate).toLocaleDateString('pt-BR')} • {note.items.length} itens</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="block font-serif text-xl text-atelier-black">{formatMoney(note.totalAmount)}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider
                           ${note.status === 'PAID' ? 'text-green-600' : note.status === 'OVERDUE' ? 'text-red-500' : 'text-yellow-600'}
                        `}>
                           {note.status === 'PAID' ? 'Pago' : note.status === 'OVERDUE' ? 'Vencido' : 'Pendente'}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Side Conceptual Widget */}
         <div className="bg-atelier-black text-white p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
               <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">IWR Collection</span>
               <h3 className="font-serif text-3xl mt-4 leading-tight italic">
                  "Elegância não é sobre ser notado, é sobre ser lembrado."
               </h3>
            </div>
            
            <div className="relative z-10 mt-12">
               <div className="h-px w-full bg-white/20 mb-4"></div>
               <div className="flex justify-between items-end">
                  <div>
                     <span className="block text-4xl font-serif">{new Date().getDate()}</span>
                     <span className="text-xs uppercase tracking-widest opacity-60">{new Date().toLocaleDateString('pt-BR', { month: 'long' })}</span>
                  </div>
                  <Clock className="text-white opacity-40 group-hover:rotate-180 transition-transform duration-1000" size={32} />
               </div>
            </div>

            {/* Abstract Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
         </div>

      </div>
    </div>
  );
};