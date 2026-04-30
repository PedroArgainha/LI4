import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservaApi } from '../../api/reservaApi';
import { pagamentoApi } from '../../api/pagamentoApi';
import { DataTable } from '../../components/ui/DataTable';
import { EstadoBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { formatDate, formatMoney } from '../../utils/formatters';
import type { Reserva } from '../../types/reserva';
import type { MetodoPagamento } from '../../types/pagamento';
import { Loader2, Eye, CheckCircle, LogIn, LogOut, Ban, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReservasBackoffice() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('ativas');
  const [detailReserva, setDetailReserva] = useState<Reserva | null>(null);
  const [pagamentoModal, setPagamentoModal] = useState(false);
  const [checkinModal, setCheckinModal] = useState<Reserva | null>(null);
  const [espacoId, setEspacoId] = useState('');
  const [pagForm, setPagForm] = useState({ valor: '', metodo: 'MBWAY' as MetodoPagamento });

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['reservas', 'todas'],
    queryFn: reservaApi.listarTodas,
  });

  const { data: resumo } = useQuery({
    queryKey: ['pagamentos', 'resumo', detailReserva?.id],
    queryFn: () => pagamentoApi.resumo(detailReserva!.id),
    enabled: !!detailReserva && pagamentoModal,
  });

  const confirmarM = useMutation({ mutationFn: reservaApi.confirmar, onSuccess: () => { toast.success('Reserva confirmada!'); invalidate(); } });
  const checkinM   = useMutation({ mutationFn: ({ id, eId }: { id: number; eId: number }) => reservaApi.checkin(id, eId), onSuccess: () => { toast.success('Check-in realizado!'); invalidate(); setCheckinModal(null); } });
  const checkoutM  = useMutation({ mutationFn: reservaApi.checkout, onSuccess: () => { toast.success('Check-out realizado!'); invalidate(); } });
  const cancelarM  = useMutation({ mutationFn: reservaApi.cancelar, onSuccess: () => { toast.success('Reserva cancelada.'); invalidate(); } });
  const pagarM     = useMutation({
    mutationFn: () => pagamentoApi.registar(detailReserva!.id, { valor: parseFloat(pagForm.valor), metodoPagamento: pagForm.metodo }),
    onSuccess: () => { toast.success('Pagamento registado!'); invalidate(); setPagamentoModal(false); },
    onError: () => toast.error('Erro ao registar pagamento.'),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['reservas'] });

  const ativas    = reservas.filter((r) => ['PENDENTE', 'CONFIRMADA', 'EM_ESTADIA'].includes(r.estado));
  const historico = reservas.filter((r) => ['CONCLUIDA', 'CANCELADA'].includes(r.estado));
  const shown     = tab === 'ativas' ? ativas : tab === 'historico' ? historico : reservas;

  const columns = [
    { key: 'id', label: '#', sortable: true, render: (r: Reserva) => <span className="text-xs text-[#74777D] font-mono">#{r.id}</span> },
    { key: 'animalNome', label: 'Animal', sortable: true, render: (r: Reserva) => <span className="font-medium text-[#041525]">{r.animalNome ?? `#${r.animalId}`}</span> },
    { key: 'dataInicio', label: 'Entrada', sortable: true, render: (r: Reserva) => formatDate(r.dataInicio) },
    { key: 'dataFim',    label: 'Saída',   sortable: true, render: (r: Reserva) => formatDate(r.dataFim) },
    { key: 'espacoCodigo', label: 'Espaço', render: (r: Reserva) => r.espacoCodigo ? <span className="font-mono text-xs bg-[#F3F4F5] px-1.5 py-0.5 border border-[#C4C6CC]">{r.espacoCodigo}</span> : <span className="text-[#C4C6CC]">—</span> },
    { key: 'precoBase',  label: 'Valor', sortable: true, render: (r: Reserva) => <span className="font-bold text-[#041525]">{formatMoney(r.precoBase)}</span> },
    { key: 'estado',     label: 'Estado', render: (r: Reserva) => <EstadoBadge estado={r.estado} /> },
    {
      key: 'actions', label: 'Ações', className: 'w-40',
      render: (r: Reserva) => (
        <div className="flex items-center gap-1">
          <ActionBtn icon={<Eye size={13} />} title="Ver" onClick={() => setDetailReserva(r)} />
          {r.estado === 'PENDENTE'   && <ActionBtn icon={<CheckCircle size={13} />} title="Confirmar" color="text-blue-600" onClick={() => confirmarM.mutate(r.id)} />}
          {r.estado === 'CONFIRMADA' && <ActionBtn icon={<LogIn size={13} />} title="Check-in" color="text-green-600" onClick={() => setCheckinModal(r)} />}
          {r.estado === 'EM_ESTADIA' && <ActionBtn icon={<LogOut size={13} />} title="Check-out" color="text-purple-600" onClick={() => { if (confirm('Registar check-out?')) checkoutM.mutate(r.id); }} />}
          {r.estado === 'EM_ESTADIA' && <ActionBtn icon={<CreditCard size={13} />} title="Pagamento" color="text-amber-700" onClick={() => { setDetailReserva(r); setPagamentoModal(true); setPagForm({ valor: String(r.precoBase), metodo: 'MBWAY' }); }} />}
          {(r.estado === 'PENDENTE' || r.estado === 'CONFIRMADA') && <ActionBtn icon={<Ban size={13} />} title="Cancelar" color="text-red-600" onClick={() => { if (confirm('Cancelar reserva?')) cancelarM.mutate(r.id); }} />}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Reservas' }]} />
      <div>
        <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Gestão de Reservas</h1>
        <p className="text-sm text-[#44474C] mt-1">{reservas.length} reservas no sistema</p>
      </div>

      <Tabs tabs={[
        { id: 'ativas',    label: 'Ativas',   count: ativas.length },
        { id: 'historico', label: 'Histórico', count: historico.length },
        { id: 'todas',     label: 'Todas',    count: reservas.length },
      ]} active={tab} onChange={setTab} />

      <DataTable data={shown} columns={columns} searchKeys={['animalNome', 'estado', 'espacoCodigo']} loading={isLoading} emptyMessage="Sem reservas" />

      {/* Detalhe */}
      {detailReserva && !pagamentoModal && (
        <Modal open title={`Reserva #${detailReserva.id}`} onClose={() => setDetailReserva(null)}>
          <div className="space-y-4 text-sm">
            {[
              ['Animal',  detailReserva.animalNome ?? `#${detailReserva.animalId}`],
              ['Entrada', formatDate(detailReserva.dataInicio)],
              ['Saída',   formatDate(detailReserva.dataFim)],
              ['Espaço',  detailReserva.espacoCodigo ?? 'Não atribuído'],
              ['Valor Base', formatMoney(detailReserva.precoBase)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[#E7E8E9] pb-3">
                <span className="text-[#44474C]">{k}</span>
                <span className="font-medium text-[#041525]">{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-[#44474C]">Estado</span>
              <EstadoBadge estado={detailReserva.estado} />
            </div>
            {detailReserva.servicos?.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#44474C] mb-2">Serviços</p>
                {detailReserva.servicos.map((s) => (
                  <div key={s.id} className="flex justify-between text-xs py-1.5 border-b border-[#E7E8E9]">
                    <span>{s.servicoNome}</span>
                    <span className="font-medium">{formatMoney(s.servicoPreco)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Check-in modal */}
      {checkinModal && (
        <Modal open title="Registar Check-in" onClose={() => setCheckinModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-[#44474C]">Atribua um espaço de alojamento ao animal <strong>{checkinModal.animalNome}</strong>.</p>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">ID do Espaço *</label>
              <input type="number" className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]" placeholder="Ex: 3" value={espacoId} onChange={(e) => setEspacoId(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCheckinModal(null)} className="flex-1 border border-[#C4C6CC] py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5]">Cancelar</button>
              <button onClick={() => espacoId && checkinM.mutate({ id: checkinModal.id, eId: parseInt(espacoId) })} disabled={!espacoId || checkinM.isPending}
                className="flex-1 bg-green-700 text-white py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2">
                {checkinM.isPending && <Loader2 size={14} className="animate-spin" />} Confirmar Check-in
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Pagamento modal */}
      {pagamentoModal && detailReserva && (
        <Modal open title={`Registar Pagamento — Reserva #${detailReserva.id}`} onClose={() => setPagamentoModal(false)}>
          <div className="space-y-4">
            {resumo && (
              <div className="bg-[#F3F4F5] p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-[#44474C]">Total reserva</span><span className="font-bold">{formatMoney(resumo.totalReserva)}</span></div>
                <div className="flex justify-between"><span className="text-[#44474C]">Total pago</span><span className="text-green-700 font-bold">{formatMoney(resumo.totalPago)}</span></div>
                <div className="flex justify-between border-t border-[#C4C6CC] pt-1 mt-1"><span className="font-bold text-[#041525]">Saldo pendente</span><span className="font-bold text-red-700">{formatMoney(resumo.saldoPendente)}</span></div>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Valor (€) *</label>
              <input type="number" step="0.01" className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]" value={pagForm.valor} onChange={(e) => setPagForm((f) => ({ ...f, valor: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Método *</label>
              <select className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19] bg-white" value={pagForm.metodo} onChange={(e) => setPagForm((f) => ({ ...f, metodo: e.target.value as MetodoPagamento }))}>
                {['MBWAY', 'CARTAO', 'TRANSFERENCIA', 'NUMERARIO'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPagamentoModal(false)} className="flex-1 border border-[#C4C6CC] py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5]">Cancelar</button>
              <button onClick={() => pagarM.mutate()} disabled={!pagForm.valor || pagarM.isPending}
                className="flex-1 bg-[#775A19] text-white py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#5d4201] disabled:opacity-50 flex items-center justify-center gap-2">
                {pagarM.isPending && <Loader2 size={14} className="animate-spin" />} Registar Pagamento
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ActionBtn({ icon, title, color = 'text-[#44474C]', onClick }: { icon: React.ReactNode; title: string; color?: string; onClick: () => void }) {
  return (
    <button title={title} onClick={onClick} className={`p-1.5 ${color} hover:bg-[#F3F4F5] transition-colors`}>
      {icon}
    </button>
  );
}
