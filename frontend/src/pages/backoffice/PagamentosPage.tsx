import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pagamentoApi } from '../../api/pagamentoApi';
import { DataTable } from '../../components/ui/DataTable';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { formatDateTime, formatMoney } from '../../utils/formatters';
import type { Pagamento } from '../../types/pagamento';
import { FileDown } from 'lucide-react';
import toast from 'react-hot-toast';

const METODO_LABELS: Record<string, string> = { MBWAY: 'MBWay', CARTAO: 'Cartão', TRANSFERENCIA: 'Transferência', NUMERARIO: 'Numerário' };

export default function PagamentosPage() {
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.substring(0, 7) + '-01';
  const [inicio, setInicio] = useState(monthStart);
  const [fim, setFim] = useState(today);

  const { data: pagamentos = [], isLoading } = useQuery({
    queryKey: ['pagamentos', 'periodo', inicio, fim],
    queryFn: () => pagamentoApi.porPeriodo(inicio, fim),
    enabled: !!inicio && !!fim,
  });

  const total = pagamentos.reduce((acc, p) => acc + p.valor, 0);

  const downloadFatura = async (id: number) => {
    try {
      const blob = await pagamentoApi.fatura(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `fatura-${id}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Fatura não disponível.'); }
  };

  const columns = [
    { key: 'id',               label: '#',         render: (p: Pagamento) => <span className="text-xs text-[#74777D] font-mono">#{p.id}</span> },
    { key: 'reservaId',        label: 'Reserva',   render: (p: Pagamento) => <span className="font-mono text-xs">#{p.reservaId}</span> },
    { key: 'valor',            label: 'Valor',     sortable: true, render: (p: Pagamento) => <span className="font-bold text-[#041525]">{formatMoney(p.valor)}</span> },
    { key: 'metodoPagamento',  label: 'Método',    render: (p: Pagamento) => <span className="text-xs bg-[#F3F4F5] border border-[#C4C6CC] px-2 py-0.5 font-medium">{METODO_LABELS[p.metodoPagamento] ?? p.metodoPagamento}</span> },
    { key: 'instantePagamento',label: 'Data',      sortable: true, render: (p: Pagamento) => <span className="text-[#44474C]">{formatDateTime(p.instantePagamento)}</span> },
    { key: 'fatura', label: 'Fatura', render: (p: Pagamento) => (
      <button onClick={() => downloadFatura(p.id)} className="flex items-center gap-1 text-xs text-[#775A19] hover:text-[#5d4201] font-medium">
        <FileDown size={13} /> PDF
      </button>
    )},
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Pagamentos' }]} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Pagamentos</h1>
          <p className="text-sm text-[#44474C] mt-1">Total no período: <span className="font-bold text-[#041525]">{formatMoney(total)}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border border-[#C4C6CC] px-2 py-1.5 text-sm focus:outline-none focus:border-[#775A19]" />
            <span className="text-[#74777D]">→</span>
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="border border-[#C4C6CC] px-2 py-1.5 text-sm focus:outline-none focus:border-[#775A19]" />
          </div>
        </div>
      </div>
      <DataTable data={pagamentos} columns={columns} searchKeys={['metodoPagamento']} loading={isLoading} emptyMessage="Sem pagamentos no período" />
    </div>
  );
}
