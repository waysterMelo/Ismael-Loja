import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Tag, ShoppingBag, User, ArrowRight, Loader2 } from 'lucide-react';
import { get, post } from '../api/client';
import { useToast } from '../context/ToastContext';

interface ApiCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isVip: boolean;
  createdAt: string;
}

export const POS: React.FC = () => {
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ApiCustomer | null>(null);
  const [cart, setCart] = useState<Array<{ id: string; description: string; quantity: number; price: number }>>([]);
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [generatedNote, setGeneratedNote] = useState<{id: string; dueDate: string; totalAmount: number} | null>(null);
  const [viewState, setViewState] = useState<'INPUT' | 'SUCCESS'>('INPUT');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  interface SaleResponse {
    sale: {
      id: string;
      promissoryNote: {
        id: string;
        dueDate: string;
        totalAmount: number;
      };
    };
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await get<{customers: ApiCustomer[]}>('/api/customers');
      setCustomers(response.customers || []);
    } catch (e) {
      toast.error('Falha ao carregar clientes');
    }
  };

  const addToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDesc || !itemPrice) return;
    setCart([...cart, { id: Date.now().toString(), description: itemDesc, price: parseFloat(itemPrice), quantity: 1 }]);
    setItemDesc('');
    setItemPrice('');
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      toast.error('Selecione um cliente antes de finalizar');
      return;
    }
    if (cart.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }
    setLoading(true);
    try {
      const response = await post<SaleResponse>('/api/sales', {
        customerId: selectedCustomer.id,
        items: cart.map(item => ({ description: item.description, quantity: item.quantity, price: item.price })),
      });
      setGeneratedNote(response.sale.promissoryNote);
      setViewState('SUCCESS');
      setCart([]);
      toast.success('Venda finalizada com sucesso');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao finalizar venda');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val: number | string) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

  if (viewState === 'SUCCESS' && generatedNote) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8">
         <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-green-600">Transação Aprovada</span>
            <h2 className="text-5xl font-serif text-gray-900">Venda Realizada</h2>
         </div>
         <div className="bg-white p-8 border shadow-xl max-w-lg w-full">
            <h3 className="text-xl font-bold tracking-widest uppercase text-gray-900 mb-4">IWR Moda — Nota Promissória</h3>
            <p className="text-sm mb-2"><strong>Emitente:</strong> {selectedCustomer?.name}</p>
            <p className="text-sm mb-4"><strong>Valor:</strong> {formatMoney(generatedNote.totalAmount)}</p>
            <p className="text-sm mb-2"><strong>Vencimento:</strong> {new Date(generatedNote.dueDate).toLocaleDateString('pt-BR')}</p>
            <p className="text-xs text-gray-500 mt-4">ID: {generatedNote.id.slice(0, 8)}</p>
         </div>
         <div className="flex gap-6">
            <button onClick={() => window.open(`/print-note?id=${generatedNote.id}`, '_blank')} className="px-8 py-4 bg-white text-gray-900 border border-gray-200 hover:border-gray-900 transition-colors font-medium tracking-wide">
               Imprimir
            </button>
            <button onClick={() => {setViewState('INPUT'); setGeneratedNote(null); setSelectedCustomer(null);}} className="px-8 py-4 bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium tracking-wide flex items-center gap-2">
               Nova Venda <ArrowRight size={16}/>
            </button>
         </div>
      </div>
     );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row overflow-hidden border border-gray-200 bg-white relative">
       <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-xl mx-auto w-full space-y-12">
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                   <User size={16} />
                   <span className="text-xs font-bold uppercase tracking-widest">Cliente</span>
                </div>
                <div className="relative">
                   <select className="w-full bg-transparent border-b border-gray-200 py-3 pr-8 text-xl font-serif text-gray-900 outline-none appearance-none cursor-pointer hover:border-gray-500 transition-colors"
                      onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                      value={selectedCustomer?.id || ''}
                   >
                      <option value="">Selecione um cliente...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                   <ChevronRight size={20} className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                </div>
             </div>
             <form onSubmit={addToCart} className="space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Tag size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Item</span>
                   </div>
                   <input autoFocus placeholder="Descrição da peça..." className="w-full bg-transparent border-b border-gray-200 py-3 text-xl font-medium text-gray-900 outline-none placeholder:text-gray-300 focus:border-gray-900 transition-colors" value={itemDesc} onChange={e => setItemDesc(e.target.value)} />
                </div>
                <div className="flex items-end gap-6">
                   <div className="flex-1 space-y-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Valor</span>
                      <div className="flex items-center">
                         <span className="text-xl font-serif text-gray-400 mr-2">R$</span>
                         <input type="number" placeholder="0,00" className="w-full bg-transparent border-b border-gray-200 py-3 text-3xl font-serif text-gray-900 outline-none placeholder:text-gray-200 focus:border-gray-900 transition-colors" value={itemPrice} onChange={e => setItemPrice(e.target.value)} />
                      </div>
                   </div>
                   <button type="submit" className="h-14 w-14 border border-gray-900 rounded-full flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all">
                      <Plus size={24} />
                   </button>
                </div>
             </form>
             <div className="pt-8">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-4">Coleção Rápida</span>
                <div className="flex flex-wrap gap-3">
                   {['Camiseta', 'Calça Alfaiataria', 'Vestido', 'Blazer', 'Acessório', 'Sapatos'].map((label) => (
                      <button
                        key={label}
                        onClick={() => setItemDesc(label)}
                        className="px-4 py-2 border border-gray-200 text-sm text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors"
                      >
                         {label}
                      </button>
                   ))}
                </div>
             </div>
          </div>
       </div>
       <div className="w-full lg:w-[450px] bg-[#121212] text-white flex flex-col shadow-2xl">
          <div className="p-8 border-b border-white/10">
             <span className="text-xs font-mono uppercase tracking-widest text-white/50">Carrinho</span>
             <h3 className="font-serif text-2xl italic">Sua Seleção</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
             {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                   <Tag size={24} />
                   <p className="font-serif italic text-lg mt-2">O carrinho está vazio</p>
                </div>
             ) : (
                cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center pb-4 border-b border-white/5">
                      <div>
                         <p className="font-medium text-lg">{item.description}</p>
                         <p className="text-xs text-white/50">Qtd: {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="font-serif text-lg">R$ {item.price.toFixed(2)}</span>
                         <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-white/30 hover:text-red-400">
                            <Trash2 size={16}/>
                         </button>
                      </div>
                   </div>
                ))
             )}
          </div>
          <div className="p-8 bg-[#1A1A1A] border-t border-white/10">
             <div className="flex justify-between items-end mb-8">
                <span className="text-xs text-white/50 uppercase tracking-widest">Total</span>
                <span className="text-4xl font-serif">{formatMoney(total)}</span>
             </div>
             <button onClick={handleCheckout} disabled={cart.length === 0 || !selectedCustomer || loading}
               className="w-full py-5 bg-white text-[#121212] font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
               {loading ? <Loader2 className="animate-spin" size={18} /> : 'Finalizar Venda'} <ArrowRight size={18} />
             </button>
          </div>
       </div>
    </div>
  );
};
