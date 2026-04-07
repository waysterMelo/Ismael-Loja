import { useState, useEffect } from 'react';
import { get } from '../api/client';
import { ClipboardList, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string;
  user: { name: string; email: string };
  action: string;
  entity: string;
  entityId: string;
  payload: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  CREATE_CUSTOMER: 'Cliente criado',
  UPDATE_CUSTOMER: 'Cliente editado',
  CREATE_SALE: 'Venda criada',
  PAY_PROMISSORY_NOTE: 'Título baixado',
};

const ENTITY_FILTERS = ['Todos', 'Customer', 'Sale', 'PromissoryNote'];
const ACTION_FILTERS = ['Todas', 'CREATE_CUSTOMER', 'UPDATE_CUSTOMER', 'CREATE_SALE', 'PAY_PROMISSORY_NOTE'];

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (entityFilter && entityFilter !== 'Todos') params.set('entity', entityFilter);
      if (actionFilter && actionFilter !== 'Todas') params.set('action', actionFilter);

      const response = await get<{ logs: AuditLog[] }>(`/api/audit-log?${params.toString()}`);
      setLogs(response.logs || []);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter, actionFilter]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gray-500 block mb-2">Monitoramento</span>
          <h1 className="text-4xl font-serif text-gray-900">Log de Auditoria</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase">Entidade:</span>
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-gray-900"
          >
            {ENTITY_FILTERS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase">Ação:</span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-gray-900"
          >
            {ACTION_FILTERS.map(a => <option key={a} value={a}>{a === 'Todas' ? 'Todas' : ACTION_LABELS[a] || a}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-500 uppercase text-xs">
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Usuário</th>
              <th className="px-4 py-3 font-semibold">Ação</th>
              <th className="px-4 py-3 font-semibold">Entidade</th>
              <th className="px-4 py-3 font-semibold">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                  <ClipboardList size={24} className="mx-auto mb-2 opacity-30" />
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              logs.map(log => {
                const getActionColor = () => {
                  if (log.action.startsWith('CREATE_')) return 'bg-green-100 text-green-700';
                  if (log.action.startsWith('UPDATE_')) return 'bg-yellow-100 text-yellow-700';
                  if (log.action.startsWith('PAY_')) return 'bg-blue-100 text-blue-700';
                  return 'bg-gray-100 text-gray-700';
                };

                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{log.user?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${getActionColor()}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.entity}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{log.entityId.slice(0, 8)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
