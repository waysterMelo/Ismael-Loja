import React, { useState, useEffect } from 'react';
import { Customer, CartItem, PromissoryNote, SaleStatus } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Search, Trash2, ChevronRight, Tag, ShoppingBag, CreditCard, User } from 'lucide-react';
import { PromissoryNoteTemplate } from '../components/PromissoryNoteTemplate';

export const POS: React.FC = () => {
  const [customers] = useState<Customer[]>(storageService.getCustomers());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [generatedNote, setGeneratedNote] = useState<PromissoryNote | null>(null);
  const [viewState, setViewState] = useState<'INPUT' | 'SUCCESS'>('INPUT');

  const addToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDesc || !itemPrice) return;
    setCart([...cart, { id: Date.now().toString(), description: itemDesc, price: parseFloat(itemPrice), quantity: 1 }]);
    setItemDesc(''); setItemPrice('');
  };

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = () => {
    if (!selectedCustomer) return;
    const d = new Date(); d.setDate(d.getDate() + 30);
    const note: PromissoryNote = {
      id: Math.floor(Math.random() * 10000).toString(),
      customerId: selectedCustomer.id, customerName: selectedCustomer.name, customerCpf: selectedCustomer.cpf, customerPhone: selectedCustomer.phone,
      items: cart, totalAmount: total, issueDate: new Date().toISOString(), dueDate: d.toISOString(), status: SaleStatus.PENDING
    };
    storageService.addNote(note);
    setGeneratedNote(note);
    setViewState('SUCCESS');
    setCart([]);
  };

  if (viewState === 'SUCCESS' && generatedNote) {
     return (
        <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in-up pb-20">
           <div className="relative">
              <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full"></div>
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl relative z-10">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
           </div>
           
           <h2 className="text-3xl font-bold text-system-text tracking-tight">Venda Realizada</h2>
           
           <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 transform hover:scale-[1.01] transition-transform duration-300">
              <PromissoryNoteTemplate note={generatedNote} />
           </div>
           
           <div className="flex gap-4 pt-4">
              <button onClick={() => window.print()} className="px-8 py-3 bg-white text-system-text border border-gray-200 shadow-sm rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                 Imprimir Comprovante
              </button>
              <button onClick={() => {setViewState('INPUT'); setGeneratedNote(null); setSelectedCustomer(null);}} className="px-8 py-3 bg-system-text text-white rounded-xl font-semibold hover:bg-black shadow-lg shadow-black/20 ios-btn">
                 Nova Venda
              </button>
           </div>
        </div>
     );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
       
       {/* Left: Controls */}
       <div className="flex-1 flex flex-col gap-6">
          
          {/* Customer Selector Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-1 shadow-ios border border-white/60">
             <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                   <User size={16} className="text-system-blue" />
                   <h3 className="text-xs font-bold uppercase text-system-subtext tracking-wider">Cliente Selecionado</h3>
                </div>
                <div className="relative group">
                   <select 
                      className="w-full bg-gray-50/50 p-4 pr-10 rounded-xl appearance-none outline-none font-semibold text-lg text-system-text border border-gray-100 focus:border-system-blue/30 focus:bg-white transition-all cursor-pointer"
                      onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                      value={selectedCustomer?.id || ''}
                   >
                      <option value="">Toque para selecionar...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-system-blue transition-colors">
                      <ChevronRight size={20} className="rotate-90" />
                   </div>
                </div>
             </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[24px] p-6 shadow-ios border border-white/60 flex flex-col">
             <div className="flex items-center gap-2 mb-5">
                <Tag size={16} className="text-system-blue" />
                <h3 className="text-xs font-bold uppercase text-system-subtext tracking-wider">Novo Item</h3>
             </div>
             
             <form onSubmit={addToCart} className="space-y-4">
                <input 
                  autoFocus
                  placeholder="Descrição do produto (ex: Camisa Polo)" 
                  className="w-full text-lg p-5 bg-gray-50 rounded-2xl outline-none border border-transparent focus:bg-white focus:border-system-blue/30 focus:ring-4 focus:ring-system-blue/5 transition-all placeholder:text-gray-400 font-medium"
                  value={itemDesc} onChange={e => setItemDesc(e.target.value)}
                />
                <div className="flex gap-4">
                   <div className="flex-1 relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">R$</span>
                      <input 
                        type="number" placeholder="0,00" 
                        className="w-full text-2xl font-bold p-5 pl-14 bg-gray-50 rounded-2xl outline-none border border-transparent focus:bg-white focus:border-system-blue/30 focus:ring-4 focus:ring-system-blue/5 transition-all placeholder:text-gray-300"
                        value={itemPrice} onChange={e => setItemPrice(e.target.value)}
                      />
                   </div>
                   <button type="submit" className="bg-system-text text-white w-24 rounded-2xl flex items-center justify-center hover:bg-black shadow-lg shadow-black/10 transition-all ios-btn">
                      <Plus size={28} />
                   </button>
                </div>
             </form>

             {/* Quick Grid */}
             <div className="mt-8 flex-1">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 ml-1">Atalhos Rápidos</h4>
                <div className="grid grid-cols-3 gap-3">
                   {['Camiseta', 'Calça', 'Vestido', 'Sapato', 'Acessório', 'Bermuda'].map((label, i) => (
                      <button 
                        key={label} 
                        onClick={() => setItemDesc(label)} 
                        className="py-4 px-2 bg-white border border-gray-100 shadow-sm rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-blue-200 hover:text-system-blue active:scale-95 transition-all duration-200 flex flex-col items-center gap-2"
                      >
                         <ShoppingBag size={18} className={`opacity-50 ${i % 2 === 0 ? 'text-blue-500' : 'text-purple-500'}`} />
                         {label}
                      </button>
                   ))}
                </div>
             </div>
          </div>
       </div>

       {/* Right: Receipt / Cart */}
       <div className="w-full md:w-96 bg-white rounded-[24px] shadow-2xl border border-gray-200 flex flex-col overflow-hidden relative">
          
          {/* Top ZigZag Decoration simulating paper receipt */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-100 to-white z-10"></div>
          
          <div className="p-6 bg-gray-50/80 border-b border-dashed border-gray-200">
             <div className="flex justify-between items-start">
                <div>
                   <h3 className="font-bold text-xl text-system-text tracking-tight">Carrinho</h3>
                   <p className="text-xs text-gray-400 font-medium mt-0.5">#{Math.floor(Math.random() * 1000)} • {new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                   <ShoppingBag size={14} className="text-gray-400" />
                </div>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]">
             {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 opacity-60">
                   <ShoppingBag size={48} strokeWidth={1} />
                   <p className="text-sm">Carrinho vazio</p>
                </div>
             ) : (
                cart.map(item => (
                   <div key={item.id} className="group flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">1x</div>
                         <div>
                            <p className="font-bold text-sm text-gray-800">{item.description}</p>
                            <p className="text-xs text-gray-400">Unitário</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="font-bold text-sm text-system-text">R$ {item.price}</span>
                         <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                            <Trash2 size={16}/>
                         </button>
                      </div>
                   </div>
                ))
             )}
          </div>

          {/* Bottom Total Area */}
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
             <div className="flex justify-between items-end mb-6">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total a Pagar</span>
                <span className="text-3xl font-bold text-system-text tracking-tight">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
             </div>
             <button 
               onClick={handleCheckout}
               disabled={cart.length === 0 || !selectedCustomer}
               className="w-full py-4 bg-system-blue text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center justify-center gap-2"
             >
               <CreditCard size={20} /> Finalizar Venda
             </button>
          </div>
       </div>
    </div>
  );
};