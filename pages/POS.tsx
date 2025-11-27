import React, { useState } from 'react';
import { Customer, CartItem, PromissoryNote, SaleStatus } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Trash2, ChevronRight, Tag, ShoppingBag, CreditCard, User, ArrowRight } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8 animate-enter">
           <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-green-600">Transação Aprovada</span>
              <h2 className="text-5xl font-serif text-atelier-black">Venda Realizada</h2>
           </div>
           
           <div className="bg-white p-4 rounded shadow-2xl shadow-gray-200/50 max-w-lg w-full transform hover:scale-[1.01] transition-transform duration-500 border border-gray-100">
              <PromissoryNoteTemplate note={generatedNote} />
           </div>
           
           <div className="flex gap-6">
              <button onClick={() => window.print()} className="px-8 py-4 bg-white text-atelier-black border border-atelier-line hover:border-atelier-black transition-colors font-medium tracking-wide">
                 Imprimir Documento
              </button>
              <button onClick={() => {setViewState('INPUT'); setGeneratedNote(null); setSelectedCustomer(null);}} className="px-8 py-4 bg-atelier-black text-white hover:bg-atelier-accent transition-colors font-medium tracking-wide flex items-center gap-2">
                 Nova Venda <ArrowRight size={16}/>
              </button>
           </div>
        </div>
     );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row overflow-hidden border border-atelier-line bg-white">
       
       {/* Left: Atelier Selection (Light & Editorial) */}
       <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto">
          
          <div className="max-w-xl mx-auto w-full space-y-12">
             
             {/* Customer Input - Minimalist */}
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-atelier-secondary mb-2">
                   <User size={16} />
                   <span className="text-xs font-bold uppercase tracking-widest">Cliente</span>
                </div>
                <div className="relative group">
                   <select 
                      className="w-full bg-transparent border-b border-atelier-line py-3 pr-8 text-2xl font-serif text-atelier-black outline-none appearance-none cursor-pointer hover:border-atelier-black transition-colors"
                      onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                      value={selectedCustomer?.id || ''}
                   >
                      <option value="">Selecione um cliente...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                   <ChevronRight size={20} className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90 text-atelier-secondary pointer-events-none" />
                </div>
             </div>

             {/* Item Input - Editorial Style */}
             <form onSubmit={addToCart} className="space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-atelier-secondary mb-2">
                      <Tag size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Item</span>
                   </div>
                   <input 
                     autoFocus
                     placeholder="Descrição da peça..." 
                     className="w-full bg-transparent border-b border-atelier-line py-3 text-xl font-medium text-atelier-black outline-none placeholder:text-gray-300 focus:border-atelier-black transition-colors"
                     value={itemDesc} onChange={e => setItemDesc(e.target.value)}
                   />
                </div>
                
                <div className="flex items-end gap-6">
                   <div className="flex-1 space-y-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-atelier-secondary">Valor</span>
                      <div className="flex items-center">
                         <span className="text-xl font-serif text-atelier-secondary mr-2">R$</span>
                         <input 
                           type="number" placeholder="0,00" 
                           className="w-full bg-transparent border-b border-atelier-line py-3 text-3xl font-serif text-atelier-black outline-none placeholder:text-gray-200 focus:border-atelier-black transition-colors"
                           value={itemPrice} onChange={e => setItemPrice(e.target.value)}
                         />
                      </div>
                   </div>
                   <button type="submit" className="h-14 w-14 border border-atelier-black rounded-full flex items-center justify-center hover:bg-atelier-black hover:text-white transition-all duration-300 group">
                      <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                   </button>
                </div>
             </form>

             {/* Quick Actions */}
             <div className="pt-8">
                <span className="text-xs font-bold uppercase tracking-widest text-atelier-secondary block mb-4">Coleção Rápida</span>
                <div className="flex flex-wrap gap-3">
                   {['Camiseta', 'Calça Alfaiataria', 'Vestido', 'Blazer', 'Acessório', 'Sapatos'].map((label) => (
                      <button 
                        key={label} 
                        onClick={() => setItemDesc(label)} 
                        className="px-4 py-2 border border-atelier-line text-sm text-atelier-secondary hover:border-atelier-black hover:text-atelier-black transition-colors rounded-none"
                      >
                         {label}
                      </button>
                   ))}
                </div>
             </div>

          </div>
       </div>

       {/* Right: The Black Receipt (Onyx Mode) */}
       <div className="w-full lg:w-[450px] bg-[#121212] text-white flex flex-col relative shadow-2xl">
          
          {/* Header */}
          <div className="p-8 border-b border-white/10 flex justify-between items-start">
             <div>
                <span className="text-xs font-mono uppercase tracking-widest text-white/50 block mb-1">Carrinho Atual</span>
                <h3 className="font-serif text-2xl italic">Sua Seleção</h3>
             </div>
             <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
                <ShoppingBag size={18} className="text-white" />
             </div>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
             {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
                   <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center">
                      <Tag size={24} />
                   </div>
                   <p className="font-serif italic text-lg">O carrinho está vazio</p>
                </div>
             ) : (
                cart.map(item => (
                   <div key={item.id} className="group flex justify-between items-center pb-4 border-b border-white/5 hover:border-white/20 transition-colors">
                      <div className="flex items-center gap-4">
                         <span className="text-xs font-mono text-white/40">01</span>
                         <div>
                            <p className="font-medium text-lg">{item.description}</p>
                            <p className="text-xs text-white/50 uppercase tracking-wider">Peça Única</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <span className="font-serif text-lg">R$ {item.price}</span>
                         <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-white/30 hover:text-red-400 transition-colors">
                            <Trash2 size={16}/>
                         </button>
                      </div>
                   </div>
                ))
             )}
          </div>

          {/* Footer / Checkout */}
          <div className="p-8 bg-[#1A1A1A] border-t border-white/10">
             <div className="flex justify-between items-end mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">Total Final</span>
                <span className="text-4xl font-serif">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
             </div>
             
             <button 
               onClick={handleCheckout}
               disabled={cart.length === 0 || !selectedCustomer}
               className="w-full py-5 bg-white text-[#121212] font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
             >
               Confirmar Pedido <ArrowRight size={18} />
             </button>
          </div>
       </div>
    </div>
  );
};