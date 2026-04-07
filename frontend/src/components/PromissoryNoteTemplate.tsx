import { SaleStatus } from '../types';

interface Props {
  note: {
    id: string;
    customerName: string;
    customerPhone: string;
    customerCpf: string;
    items: { id: string; description: string; quantity: number; price: number }[];
    totalAmount: number;
    issueDate: string;
    dueDate: string;
    status: SaleStatus;
  };
}

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

function formatDateExt(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatDueDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export const PromissoryNoteTemplate: React.FC<Props> = ({ note }) => {
  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-white p-10 md:p-12 text-black font-sans print:p-0 print:max-w-none">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">IWR Moda</h1>
          <p className="text-sm uppercase tracking-wide text-gray-600 mt-1">Nota Promissória</p>
          <p className="text-xs text-gray-400 font-mono mt-1">#{note.id}</p>
        </div>
        <div className="text-right">
          <span className="block text-4xl font-bold">{formatMoney(note.totalAmount)}</span>
          <span className="text-xs text-gray-500 mt-1">Vencimento: {formatDueDateShort(note.dueDate)}</span>
        </div>
      </div>

      {/* Legal Text */}
      <div className="mb-10 text-sm leading-8 text-justify text-gray-800">
        <p>
          Ao dia <span className="font-bold border-b border-dashed border-gray-400 mx-1">{formatDateExt(note.dueDate)}</span>,
          pagarei(emos) por esta única via de <strong>NOTA PROMISSÓRIA</strong> a
          <strong> IWR MODA LTDA</strong>, a quantia de <span className="font-bold border-b border-dashed border-gray-400 mx-1">{formatMoney(note.totalAmount)}</span>
          em moeda corrente deste país.
        </p>
      </div>

      {/* Items Table */}
      <div className="mb-10">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 border-b border-gray-300 font-bold text-xs uppercase tracking-wider">Descrição</th>
              <th className="text-center p-3 border-b border-gray-300 font-bold text-xs uppercase tracking-wider w-20">Qtd</th>
              <th className="text-right p-3 border-b border-gray-300 font-bold text-xs uppercase tracking-wider w-32">Preço Unit.</th>
            </tr>
          </thead>
          <tbody>
            {note.items.map((item, i) => (
              <tr key={item.id || i} className="border-b border-gray-200">
                <td className="p-3 text-gray-700">{item.description}</td>
                <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                <td className="p-3 text-right font-semibold">{formatMoney(item.price)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td colSpan={2} className="p-4 text-right text-sm font-bold text-gray-500 uppercase">Total</td>
              <td className="p-4 text-right text-lg font-bold">{formatMoney(note.totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Issuer Info */}
      <div className="grid grid-cols-2 gap-8 mb-12 p-6 border border-dashed border-gray-300 rounded-lg">
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Emitente</p>
          <p className="font-bold text-lg">{note.customerName}</p>
          {note.customerCpf && <p className="text-sm text-gray-600 mt-1">CPF: {note.customerCpf}</p>}
          {note.customerPhone && <p className="text-sm text-gray-600">Tel: {note.customerPhone}</p>}
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Detalhes</p>
          <p className="text-sm text-gray-600">Emissão: {formatDueDateShort(note.issueDate)}</p>
          <p className="text-sm text-gray-600">Vencimento: {formatDueDateShort(note.dueDate)}</p>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-16 pt-8 border-t border-dashed border-gray-300 flex justify-between items-end">
        <div className="text-xs text-gray-400">
          <p>Documento gerado pelo sistema IWR Moda</p>
        </div>
        <div className="text-center">
          <div className="w-56 border-b border-black mb-2"></div>
          <p className="text-[10px] uppercase font-bold tracking-widest">{note.customerName}</p>
          <p className="text-[9px] text-gray-500">Assinatura do Emitente</p>
        </div>
      </div>
    </div>
  );
};
