import React, { useState, useEffect } from 'react';
import { Customer, CartItem, PromissoryNote, SaleStatus } from '../types';
import { storageService } from '../services/storageService';
import { ShoppingCart, Plus, Trash2, FileSignature, Check, User, Search, Calculator } from 'lucide-react';
import { PromissoryNoteTemplate } from '../components/PromissoryNoteTemplate';

export const POS: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  
  // Item Entry
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('1');

  const [generatedNote, setGeneratedNote] = useState<PromissoryNote | null>(null);

  useEffect(() => {
    setCustomers(storageService.getCustomers());
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().split('T')[0]);
  }, []);

  const addToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDesc || !itemPrice) return;
    const newItem: CartItem = {
      id: Date.now().toString(), description: itemDesc, price: parseFloat(itemPrice), quantity: parseInt(itemQty)
    };
    setCart([...cart, newItem]);
    setItemDesc(''); setItemPrice(''); setItemQty('1');
  };

  const removeFromCart = (id: string) => setCart(cart.filter(i => i.id !== id));
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleFinalize = () => {
    if (!selectedCustomer || cart.length === 0 || !dueDate) return;
    const note: PromissoryNote = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      customerId: selectedCustomer.id, customerName: selectedCustomer.name, customerCpf: selectedCustomer.cpf, customerPhone: selectedCustomer.phone,
      items: [...cart], totalAmount: total, issueDate: new Date().toISOString(), dueDate: dueDate, status: SaleStatus.PENDING, whatsappSent: false
    };
    storageService.addNote(note);
    setGeneratedNote(note);
    setCart([]); setSelectedCustomer(null);
  };

  if (generatedNote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full space-y-8 animate-fade-in-up pb-10">
        <div className="bg-green-100 text-green-700 px-8 py-4 rounded-full flex items-center gap-3 shadow-sm">
            <Check size={28} className="bg-green-600 text-white rounded-full p-1" />
            <span className="font-serif font-bold text-lg">Venda registrada com sucesso!</span>
        </div>
        <div className="w-full max-w-2xl transform scale-95 origin-top shadow-2xl">
            <PromissoryNoteTemplate note={generatedNote} />
        </div>
        <div className="flex gap-4">
            <button onClick={() => window.print()} className="bg-luxury-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-900 transition-all shadow-lg">Imprimir Nota</button>
            <button onClick={() => setGeneratedNote(null)} className="bg-gold-500 text-black px-8 py-4 rounded-xl font-bold hover:bg-gold-400 transition-all shadow-glow">Nova Venda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-fade-in-up">
      
      {/* Left Column: Input Area */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Step 1: Customer */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
             <User size={14} className="text-gold-500" /> Cliente
           </h3>
           <div className="relative">
             <select 
               className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-gold-500/20 font-medium text-gray-800 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
               value={selectedCustomer?.id || ''}
               onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
             >
               <option value="">Selecione um cliente cadastrado...</option>
               {customers.map(c => (
                 <option key={c.id} value={c.id}>{c.name} • {c.cpf}</option>
               ))}
             </select>
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
           </div>
        </div>

        {/* Step 2: Items Input */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calculator size={14} className="text-gold-500" /> Detalhes do Item
            </h3>
            
            <form onSubmit={addToCart} className="flex flex-col gap-4">
               <div>
                  <input 
                     type="text" 
                     placeholder="Descrição do Produto..."
                     className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-gold-500/20 font-medium placeholder-gray-400"
                     value={itemDesc}
                     onChange={e => setItemDesc(e.target.value)}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                    <input 
                        type="number" step="0.01" placeholder="0,00"
                        className="w-full p-4 pl-10 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-gold-500/20 font-bold text-lg text-gray-800"
                        value={itemPrice} onChange={e => setItemPrice(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">QTD</span>
                    <input 
                        type="number" min="1" placeholder="1"
                        className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-gold-500/20 font-bold text-lg text-gray-800"
                        value={itemQty} onChange={e => setItemQty(e.target.value)}
                    />
                  </div>
               </div>
               <button 
                  type="submit"
                  className="mt-2 w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg hover:shadow-xl"
               >
                  <Plus size={20} /> Adicionar ao Carrinho
               </button>
            </form>
        </div>
      </div>

      {/* Right Column: Receipt & Actions */}
      <div className="w-full lg:w-[400px] flex flex-col">
         <div className="flex-1 bg-white rounded-3xl shadow-glass border border-white/50 flex flex-col overflow-hidden relative">
            {/* Header Receipt */}
            <div className="bg-luxury-charcoal p-6 text-white relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold-500 rounded-full blur-[50px] opacity-20"></div>
               <h3 className="font-serif font-bold text-xl mb-1">Cupom de Venda</h3>
               <p className="text-gray-400 text-xs">{new Date().toLocaleDateString()}</p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                     <ShoppingCart size={40} />
                     <p className="text-sm">Carrinho vazio</p>
                  </div>
               ) : (
                  cart.map(item => (
                     <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl group">
                        <div className="flex-1">
                           <p className="font-bold text-sm text-gray-800">{item.description}</p>
                           <p className="text-xs text-gray-500">{item.quantity}x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="font-bold text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</span>
                           <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                     </div>
                  ))
               )}
            </div>

            {/* Total Section */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
               <div className="flex justify-between items-end mb-6">
                  <span className="text-sm font-bold text-gray-500 uppercase">Total a Pagar</span>
                  <span className="text-3xl font-serif font-bold text-luxury-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
               </div>

               <div className="mb-4">
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Vencimento da Promissória</label>
                 <input type="date" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none focus:border-gold-500"
                   value={dueDate} onChange={e => setDueDate(e.target.value)} />
               </div>

               <button 
                  onClick={handleFinalize} disabled={cart.length === 0 || !selectedCustomer}
                  className="w-full bg-gold-gradient text-luxury-black font-bold py-4 rounded-xl shadow-glow hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                  <FileSignature size={20} /> Finalizar Venda
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};