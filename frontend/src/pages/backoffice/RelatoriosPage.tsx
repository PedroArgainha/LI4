import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { relatorioApi } from '../../api/relatorioApi';
import { KpiCard } from '../../components/ui/KpiCard';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { formatMoney } from '../../utils/formatters';
import { FileDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RelatoriosPage() {
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.substring(0, 7) + '-01';
  const [inicio, setInicio] = useState(monthStart);
  const [fim, setFim] = useState(today);
  const [applied, setApplied] = useState({ inicio: monthStart, fim: today });

  const { data: ocupacao, isLoading: loadOc } = useQuery({
    queryKey: ['relatorios', 'ocupacao', applied.inicio, applied.fim],
    queryFn: () => relatorioApi.ocupacao(applied.inicio, applied.fim),
  });

  const { data: receitas, isLoading: loadRec } = useQuery({
    queryKey: ['relatorios', 'receitas', applied.inicio, applied.fim],
    queryFn: () => relatorioApi.receitas(applied.inicio, applied.fim),
  });

  const { data: servicos, isLoading: loadSrv } = useQuery({
    queryKey: ['relatorios', 'servicos', applied.inicio, applied.fim],
    queryFn: () => relatorioApi.servicos(applied.inicio, applied.fim),
  });

  const downloadPdf = async () => {
    try {
      const blob = await relatorioApi.ocupacaoPdf(applied.inicio, applied.fim);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `relatorio-ocupacao.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Erro ao gerar PDF.'); }
  };

  const downloadCsv = async () => {
    try {
      const blob = await relatorioApi.receitasCsv(applied.inicio, applied.fim);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `receitas.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Erro ao gerar CSV.'); }
  };

  const loading = loadOc || loadRec || loadSrv;

  return (
    <div className="space-y-8">
      <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Relatórios' }]} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Relatórios de Atividade</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border border-[#C4C6CC] px-2 py-1.5 text-sm focus:outline-none focus:border-[#775A19]" />
          <span className="text-[#74777D] text-sm">→</span>
          <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="border border-[#C4C6CC] px-2 py-1.5 text-sm focus:outline-none focus:border-[#775A19]" />
          <button onClick={() => setApplied({ inicio, fim })} className="bg-[#041525] text-white text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-slate-800 transition-colors">
            Aplicar
          </button>
          <button onClick={downloadPdf} className="flex items-center gap-1.5 border border-[#C4C6CC] text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-[#F3F4F5] text-[#44474C]">
            <FileDown size={13} /> PDF
          </button>
          <button onClick={downloadCsv} className="flex items-center gap-1.5 border border-[#C4C6CC] text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-[#F3F4F5] text-[#44474C]">
            <FileDown size={13} /> CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#775A19]" size={28} /></div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Reservas"     value={ocupacao?.totalReservas ?? 0}                   icon="calendar_month" iconBg="bg-[#D3E4FA]" iconColor="text-[#041525]" />
            <KpiCard label="Taxa de Ocupação"   value={`${Math.round((ocupacao?.taxaOcupacaoMedia ?? 0) * 100)}%`} icon="percent" iconBg="bg-[#FDD587]" iconColor="text-[#261900]" />
            <KpiCard label="Receita Total"      value={formatMoney(receitas?.totalReceitas ?? 0)}       icon="payments"       iconBg="bg-[#EBE1D5]" iconColor="text-[#18140D]" />
            <KpiCard label="Serviços Prestados" value={servicos?.servicosMaisUsados?.reduce((a: number, s: any) => a + s.total, 0) ?? 0} icon="spa" iconBg="bg-green-100" iconColor="text-green-800" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Estado das reservas */}
            {ocupacao?.reservasPorEstado && (
              <div className="bg-white border border-[#C4C6CC]">
                <div className="px-5 py-4 border-b border-[#E7E8E9]">
                  <h2 className="font-noto-serif font-semibold text-[#041525]">Reservas por Estado</h2>
                </div>
                <div className="p-5 space-y-3">
                  {Object.entries(ocupacao.reservasPorEstado).map(([estado, count]) => (
                    <div key={estado} className="flex items-center justify-between">
                      <span className="text-sm text-[#44474C]">{estado}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-[#E7E8E9] rounded-full overflow-hidden">
                          <div className="h-full bg-[#775A19] rounded-full" style={{ width: `${Math.min(100, ((count as number) / (ocupacao.totalReservas || 1)) * 100)}%` }} />
                        </div>
                        <span className="text-sm font-bold text-[#041525] w-6 text-right">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Serviços mais usados */}
            {(servicos?.servicosMaisUsados?.length ?? 0) > 0 && (
              <div className="bg-white border border-[#C4C6CC]">
                <div className="px-5 py-4 border-b border-[#E7E8E9]">
                  <h2 className="font-noto-serif font-semibold text-[#041525]">Serviços Mais Utilizados</h2>
                </div>
                <div className="divide-y divide-[#E7E8E9]">
                  {(servicos?.servicosMaisUsados ?? []).slice(0, 6).map((s: any, i: number) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#74777D] w-5">{i + 1}</span>
                        <span className="text-sm font-medium text-[#041525]">{s.nome}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-[#74777D]">{s.total}×</span>
                        <span className="text-sm font-bold text-[#775A19]">{formatMoney(s.receita)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
