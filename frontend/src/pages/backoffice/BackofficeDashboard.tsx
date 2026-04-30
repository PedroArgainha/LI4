import { useQuery } from '@tanstack/react-query';
import { reservaApi } from '../../api/reservaApi';
import { pagamentoApi } from '../../api/pagamentoApi';
import { KpiCard } from '../../components/ui/KpiCard';
import { EstadoBadge } from '../../components/ui/Badge';
import { formatDate, formatMoney } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';

export default function BackofficeDashboard() {
  const { utilizador } = useAuthStore();
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.substring(0, 7) + '-01';

  const { data: ativas = [], isLoading: loadingAtivas } = useQuery({
    queryKey: ['reservas', 'ativas', today],
    queryFn: () => reservaApi.listarAtivas(today),
  });

  const { data: todas = [] } = useQuery({
    queryKey: ['reservas', 'todas'],
    queryFn: reservaApi.listarTodas,
  });

  const { data: pagamentos = [] } = useQuery({
    queryKey: ['pagamentos', 'periodo', monthStart, today],
    queryFn: () => pagamentoApi.porPeriodo(monthStart, today),
  });

  const pendentes = todas.filter((r) => r.estado === 'PENDENTE');
  const checkins = todas.filter((r) => r.dataInicio === today && r.estado === 'CONFIRMADA');
  const receita = pagamentos.reduce((acc, p) => acc + p.valor, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">
          Bom dia{utilizador?.nome ? `, ${utilizador.nome.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-[#44474C] mt-1">{new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Animais em estadia"   value={loadingAtivas ? '…' : ativas.length}  icon="pets"       iconBg="bg-[#D3E4FA]" iconColor="text-[#041525]" />
        <KpiCard label="Reservas pendentes"   value={pendentes.length}                      icon="pending"    iconBg="bg-[#FDD587]" iconColor="text-[#261900]" />
        <KpiCard label="Check-ins hoje"       value={checkins.length}                       icon="login"      iconBg="bg-green-100"  iconColor="text-green-800" />
        <KpiCard label="Receita (mês)"        value={formatMoney(receita)}                  icon="payments"   iconBg="bg-[#EBE1D5]" iconColor="text-[#18140D]" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Animais em estadia */}
        <div className="bg-white border border-[#C4C6CC]">
          <div className="px-5 py-4 border-b border-[#E7E8E9] flex items-center justify-between">
            <h2 className="font-noto-serif font-semibold text-[#041525]">Em Estadia Agora</h2>
            <span className="text-xs text-[#74777D]">{ativas.length} animais</span>
          </div>
          <div className="divide-y divide-[#E7E8E9] max-h-72 overflow-y-auto">
            {loadingAtivas ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#775A19]" size={20} /></div>
            ) : ativas.length === 0 ? (
              <p className="text-sm text-[#74777D] text-center py-8">Nenhum animal em estadia</p>
            ) : ativas.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#F3F4F5]">
                <div>
                  <p className="text-sm font-medium text-[#041525]">{r.animalNome ?? `Animal #${r.animalId}`}</p>
                  <p className="text-xs text-[#74777D]">Saída: {formatDate(r.dataFim)} · Espaço: {r.espacoCodigo ?? '—'}</p>
                </div>
                <EstadoBadge estado={r.estado} />
              </div>
            ))}
          </div>
        </div>

        {/* Reservas pendentes */}
        <div className="bg-white border border-[#C4C6CC]">
          <div className="px-5 py-4 border-b border-[#E7E8E9] flex items-center justify-between">
            <h2 className="font-noto-serif font-semibold text-[#041525]">Reservas Pendentes</h2>
            <span className="text-xs text-[#74777D]">{pendentes.length} a aguardar</span>
          </div>
          <div className="divide-y divide-[#E7E8E9] max-h-72 overflow-y-auto">
            {pendentes.length === 0 ? (
              <p className="text-sm text-[#74777D] text-center py-8">Sem reservas pendentes</p>
            ) : pendentes.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#F3F4F5]">
                <div>
                  <p className="text-sm font-medium text-[#041525]">{r.animalNome ?? `Animal #${r.animalId}`}</p>
                  <p className="text-xs text-[#74777D]">{formatDate(r.dataInicio)} → {formatDate(r.dataFim)}</p>
                </div>
                <p className="text-sm font-bold text-[#775A19]">{formatMoney(r.precoBase)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
