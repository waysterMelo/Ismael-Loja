import { useState, useEffect } from 'react';
import { get } from '../api/client';
import { ArrowUpRight, Users, AlertOctagon } from 'lucide-react';

interface DashboardData {
  stats: {
    pendingValue: number;
    overdueCount: number;
    dueTodayValue: number;
    customerCount: number;
  };
  recentSales: Array<{
    id: string;
    totalAmount: number | string;
    status: string;
    customer: { name: string };
    createdAt: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await get<DashboardData>('/api/dashboard');
      setData(response);
    } catch (e) {
      console.error('Failed to load dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  const stats = data?.stats || { pendingValue: 0, overdueCount: 0, dueTodayValue: 0, customerCount: 0 };
  const recent = data?.recentSales || [];

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-gray-200 pb-6">
         <div>
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500 block mb-2">Visão Geral • {new Date().getFullYear()}</span>
            <h1 className="text-5xl md:text-6xl font-serif font-medium text-gray-900 leading-[0.9]">
               Performance <br/> <span className="italic text-gray-500">do Sistema</span>
            </h1>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
         <div className="bg-gray-50 p-8 hover:bg-white transition-colors group">
            <div className="flex justify-between items-start mb-8">
               <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Em Aberto</span>
               <ArrowUpRight size={20} className="text-gray-400" />
            </div>
            <div>
               <span className="text-4xl md:text-5xl font-serif text-gray-900 block mb-2">{formatMoney(stats.pendingValue)}</span>
               <span className="text-xs text-gray-400 font-mono">Receita pendente</span>
            </div>
         </div>
         <div className="bg-gray-50 p-8 hover:bg-white transition-colors group">
            <div className="flex justify-between items-start mb-8">
               <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Títulos Vencidos</span>
               <AlertOctagon size={20} className="text-red-500" />
            </div>
            <div>
               <span className="text-4xl md:text-5xl font-serif text-gray-900 block mb-2">{stats.overdueCount}</span>
               <span className="text-xs text-gray-400 font-mono">Ação necessária imediata</span>
            </div>
         </div>
         <div className="bg-gray-50 p-8 hover:bg-white transition-colors group">
            <div className="flex justify-between items-start mb-8">
               <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Base de Clientes</span>
               <Users size={20} className="text-gray-400" />
            </div>
            <div>
               <span className="text-4xl md:text-5xl font-serif text-gray-900 block mb-2">{stats.customerCount}</span>
               <span className="text-xs text-gray-400 font-mono">Clientes ativos no sistema</span>
            </div>
         </div>
      </div>

      {recent.length > 0 && (
        <div>
          <h3 className="font-serif text-2xl text-gray-900 italic mb-6">Últimas Vendas</h3>
          <div className="space-y-4">
            {recent.slice(0, 8).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-6 border-b border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xs text-gray-400">#{sale.id.slice(0, 8)}</span>
                  <div>
                    <p className="font-medium text-lg text-gray-900">{sale.customer?.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(sale.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-serif text-xl text-gray-900">{formatMoney(Number(sale.totalAmount))}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider
                    ${sale.status === 'PAID' ? 'text-green-600' : sale.status === 'OVERDUE' ? 'text-red-500' : 'text-yellow-600'}
                  `}>
                    {sale.status === 'PAID' ? 'Pago' : sale.status === 'OVERDUE' ? 'Vencido' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
