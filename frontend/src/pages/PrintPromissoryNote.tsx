import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { get } from '../api/client';
import { PromissoryNoteTemplate } from '../components/PromissoryNoteTemplate';
import { SaleStatus } from '../types';

interface ApiNote {
  id: string;
  customerId: string;
  customer: { name: string; phone: string | null; cpf: string | null };
  totalAmount: number | string;
  dueDate: string;
  status: string;
  sale?: {
    items: { id: string; description: string; quantity: number; price: number | string }[];
    createdAt: string;
  };
}

export const PrintPromissoryNote: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [note, setNote] = useState<ApiNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) {
      setError('ID do título não informado');
      setLoading(false);
      return;
    }

    get<{ note: ApiNote }>(`/api/promissory-notes/${id}`)
      .then(response => {
        setNote(response.note);
        setTimeout(() => window.print(), 500);
      })
      .catch(() => {
        setError('Não foi possível carregar a nota promissória');
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Carregando...</div>;
  if (error) return <div className="flex flex-col items-center justify-center h-screen text-center space-y-4 font-sans"><p className="text-red-600 text-lg font-bold">{error}</p><button onClick={() => window.close()} className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-700 transition-colors">Fechar</button></div>;
  if (!note) return null;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <PromissoryNoteTemplate note={{
        id: note.id.slice(0, 8),
        customerName: note.customer?.name || '',
        customerPhone: note.customer?.phone || '',
        customerCpf: note.customer?.cpf || '',
        items: note.sale?.items?.map(item => ({ id: item.id, description: item.description, quantity: item.quantity, price: Number(item.price) })) || [],
        totalAmount: Number(note.totalAmount),
        dueDate: note.dueDate,
        issueDate: note.sale?.createdAt || note.dueDate,
        status: (note.status === 'PENDING' ? SaleStatus.PENDING : note.status === 'PAID' ? SaleStatus.PAID : SaleStatus.OVERDUE) as SaleStatus,
      }} />
    </div>
  );
};
