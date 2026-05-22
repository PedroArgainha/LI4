import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservaApi } from '../../api/reservaApi';
import { pagamentoApi } from '../../api/pagamentoApi';
import { espacoApi } from '../../api/espacoApi';
import { DataTable } from '../../components/ui/DataTable';
import { EstadoBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { formatDate, formatMoney } from '../../utils/formatters';
import type { Reserva } from '../../types/reserva';
import type { MetodoPagamento } from '../../types/pagamento';
import type { EspacoAlojamento } from '../../types/espaco';
import { Loader2, Eye, LogIn, LogOut, Ban, CreditCard, MapPin } from 'lucide-react';
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

  const podeConsultarEspacos = Boolean(
      checkinModal?.animalEspecie && checkinModal?.animalPorte && checkinModal?.dataInicio && checkinModal?.dataFim,
  );

  const { data: espacosDisponiveis = [], isLoading: loadingEspacos, isError: erroEspacos } = useQuery({
    queryKey: [
      'espacos',
      'disponiveis-checkin',
      checkinModal?.animalEspecie,
      checkinModal?.animalPorte,
      checkinModal?.dataInicio,
      checkinModal?.dataFim,
    ],
    queryFn: () =>
        espacoApi.listarDisponiveis({
          especie: checkinModal!.animalEspecie!,
          porte: checkinModal!.animalPorte!,
          dataInicio: checkinModal!.dataInicio,
          dataFim: checkinModal!.dataFim,
        }),
    enabled: !!checkinModal && podeConsultarEspacos,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['reservas'] });
    qc.invalidateQueries({ queryKey: ['espacos'] });
  };

  const abrirCheckin = (reserva: Reserva) => {
    setEspacoId('');
    setCheckinModal(reserva);
  };

  const fecharCheckin = () => {
    setEspacoId('');
    setCheckinModal(null);
  };

  const checkinM = useMutation({
    mutationFn: ({ id, eId }: { id: number; eId: number }) => reservaApi.checkin(id, eId),
    onSuccess: () => {
      toast.success('Check-in realizado!');
      invalidate();
      fecharCheckin();
    },
    onError: () => toast.error('Erro ao realizar check-in.'),
  });

  const checkoutM = useMutation({
    mutationFn: reservaApi.checkout,
    onSuccess: () => { toast.success('Check-out realizado!'); invalidate(); },
    onError: () => toast.error('Erro ao realizar check-out.'),
  });

  const cancelarM = useMutation({
    mutationFn: reservaApi.cancelar,
    onSuccess: () => { toast.success('Reserva cancelada.'); invalidate(); },
    onError: () => toast.error('Erro ao cancelar reserva.'),
  });

  const pagarM = useMutation({
    mutationFn: () => pagamentoApi.registar(detailReserva!.id, { valor: parseFloat(pagForm.valor), metodoPagamento: pagForm.metodo }),
    onSuccess: () => { toast.success('Pagamento registado!'); invalidate(); setPagamentoModal(false); },
    onError: () => toast.error('Erro ao registar pagamento.'),
  });

  const ativas = reservas.filter((r) => ['PENDENTE', 'EM_ESTADIA'].includes(r.estado));
  const historico = reservas.filter((r) => ['CONCLUIDA', 'CANCELADA'].includes(r.estado));
  const shown = tab === 'ativas' ? ativas : tab === 'historico' ? historico : reservas;

  const columns = [
    { key: 'id', label: '#', sortable: true, render: (r: Reserva) => <span className="text-xs text-[#74777D] font-mono">#{r.id}</span> },
    { key: 'animalNome', label: 'Animal', sortable: true, render: (r: Reserva) => <span className="font-medium text-[#041525]">{r.animalNome ?? `#${r.animalId}`}</span> },
    { key: 'dataInicio', label: 'Entrada', sortable: true, render: (r: Reserva) => formatDate(r.dataInicio) },
    { key: 'dataFim', label: 'Saída', sortable: true, render: (r: Reserva) => formatDate(r.dataFim) },
    { key: 'codigoEspaco', label: 'Espaço', render: (r: Reserva) => r.codigoEspaco ? <span className="font-mono text-xs bg-[#F3F4F5] px-1.5 py-0.5 border border-[#C4C6CC]">{r.codigoEspaco}</span> : <span className="text-[#C4C6CC]">—</span> },
    { key: 'totalComServicos', label: 'Valor', sortable: true, render: (r: Reserva) => <span className="font-bold text-[#041525]">{formatMoney(r.totalComServicos ?? r.precoBase)}</span> },
    { key: 'estado', label: 'Estado', render: (r: Reserva) => <EstadoBadge estado={r.estado} /> },
    {
      key: 'actions', label: 'Ações', className: 'w-40',
      render: (r: Reserva) => (
          <div className="flex items-center gap-1">
            <ActionBtn icon={<Eye size={13} />} title="Ver" onClick={() => setDetailReserva(r)} />
            {r.estado === 'PENDENTE' && <ActionBtn icon={<LogIn size={13} />} title="Check-in" color="text-green-600" onClick={() => abrirCheckin(r)} />}
            {r.estado === 'EM_ESTADIA' && <ActionBtn icon={<LogOut size={13} />} title="Check-out" color="text-purple-600" onClick={() => { if (confirm('Registar check-out?')) checkoutM.mutate(r.id); }} />}
            {r.estado === 'EM_ESTADIA' && <ActionBtn icon={<CreditCard size={13} />} title="Pagamento" color="text-amber-700" onClick={() => { setDetailReserva(r); setPagamentoModal(true); setPagForm({ valor: String(r.totalComServicos ?? r.precoBase), metodo: 'MBWAY' }); }} />}
            {r.estado === 'PENDENTE' && <ActionBtn icon={<Ban size={13} />} title="Cancelar" color="text-red-600" onClick={() => { if (confirm('Cancelar reserva?')) cancelarM.mutate(r.id); }} />}
          </div>
      ),
    },
  ];

  const espacoSelecionado = espacosDisponiveis.find((e) => String(e.id) === espacoId);

  return (
      <div className="space-y-6">
        <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Reservas' }]} />
        <div>
          <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Gestão de Reservas</h1>
          <p className="text-sm text-[#44474C] mt-1">{reservas.length} reservas no sistema</p>
        </div>

        <Tabs tabs={[
          { id: 'ativas', label: 'Ativas', count: ativas.length },
          { id: 'historico', label: 'Histórico', count: historico.length },
          { id: 'todas', label: 'Todas', count: reservas.length },
        ]} active={tab} onChange={setTab} />

        <DataTable data={shown} columns={columns} searchKeys={['animalNome', 'estado', 'codigoEspaco']} loading={isLoading} emptyMessage="Sem reservas" />

        {/* Detalhe */}
        {detailReserva && !pagamentoModal && (
            <Modal open title={`Reserva #${detailReserva.id}`} onClose={() => setDetailReserva(null)}>
              <div className="space-y-4 text-sm">
                {[
                  ['Animal', detailReserva.animalNome ?? `#${detailReserva.animalId}`],
                  ['Espécie / porte', `${formatEspecie(detailReserva.animalEspecie)} · ${formatPorte(detailReserva.animalPorte)}`],
                  ['Entrada', formatDate(detailReserva.dataInicio)],
                  ['Saída', formatDate(detailReserva.dataFim)],
                  ['Espaço', detailReserva.codigoEspaco ?? 'Não atribuído'],
                  ['Valor Base', formatMoney(detailReserva.precoBase)],
                  ['Total com serviços', formatMoney(detailReserva.totalComServicos ?? detailReserva.precoBase)],
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
              </div>
            </Modal>
        )}

        {/* Check-in modal */}
        {checkinModal && (
            <Modal open title="Registar Check-in" onClose={fecharCheckin}>
              <div className="space-y-4">
                <div className="bg-[#F9F5EA] border border-[#E5D3A8] p-4 text-sm space-y-1">
                  <p className="font-medium text-[#041525]">{checkinModal.animalNome ?? `Animal #${checkinModal.animalId}`}</p>
                  <p className="text-[#44474C]">
                    {formatEspecie(checkinModal.animalEspecie)} · {formatPorte(checkinModal.animalPorte)} · {formatDate(checkinModal.dataInicio)} a {formatDate(checkinModal.dataFim)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-2">Espaço disponível *</label>

                  {loadingEspacos && (
                      <div className="flex items-center gap-2 text-sm text-[#44474C] border border-[#E7E8E9] p-3">
                        <Loader2 size={14} className="animate-spin" /> A procurar espaços compatíveis...
                      </div>
                  )}

                  {!loadingEspacos && erroEspacos && (
                      <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">
                        Não foi possível carregar os espaços disponíveis. Confirme se a API de espaços está ativa.
                      </div>
                  )}

                  {!loadingEspacos && !erroEspacos && !podeConsultarEspacos && (
                      <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">
                        A reserva não contém espécie/porte do animal. Atualize o backend para devolver estes campos no DTO da reserva.
                      </div>
                  )}

                  {!loadingEspacos && !erroEspacos && podeConsultarEspacos && espacosDisponiveis.length === 0 && (
                      <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 p-3">
                        Não existem espaços compatíveis e livres para esta reserva.
                      </div>
                  )}

                  {!loadingEspacos && espacosDisponiveis.length > 0 && (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {espacosDisponiveis.map((espaco) => (
                            <EspacoOption
                                key={espaco.id}
                                espaco={espaco}
                                selected={String(espaco.id) === espacoId}
                                onSelect={() => setEspacoId(String(espaco.id))}
                            />
                        ))}
                      </div>
                  )}
                </div>

                {espacoSelecionado && (
                    <div className="text-xs text-[#44474C] bg-[#F3F4F5] border border-[#E7E8E9] p-3">
                      Espaço selecionado: <strong>{espacoSelecionado.codigo}</strong>. Ao confirmar, a reserva passa para <strong>EM_ESTADIA</strong> e o espaço fica marcado como <strong>OCUPADO</strong>.
                    </div>
                )}

                <div className="flex gap-3">
                  <button onClick={fecharCheckin} className="flex-1 border border-[#C4C6CC] py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5]">Cancelar</button>
                  <button
                      onClick={() => espacoId && checkinM.mutate({ id: checkinModal.id, eId: Number(espacoId) })}
                      disabled={!espacoId || checkinM.isPending || loadingEspacos}
                      className="flex-1 bg-green-700 text-white py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
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

function EspacoOption({ espaco, selected, onSelect }: { espaco: EspacoAlojamento; selected: boolean; onSelect: () => void }) {
  return (
      <button
          type="button"
          onClick={onSelect}
          className={`w-full text-left border p-3 transition-colors ${selected ? 'border-green-700 bg-green-50' : 'border-[#E7E8E9] hover:bg-[#F3F4F5]'}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin size={14} className={selected ? 'text-green-700' : 'text-[#74777D]'} />
              <span className="font-mono text-sm font-bold text-[#041525]">{espaco.codigo}</span>
            </div>
            <p className="text-xs text-[#44474C]">{formatEspecie(espaco.especie)} · {formatPorte(espaco.porte)}</p>
            {espaco.observacoes && <p className="text-xs text-[#74777D] line-clamp-2">{espaco.observacoes}</p>}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-700 bg-white border border-green-200 px-2 py-1">Disponível</span>
        </div>
      </button>
  );
}

function ActionBtn({ icon, title, color = 'text-[#44474C]', onClick }: { icon: React.ReactNode; title: string; color?: string; onClick: () => void }) {
  return (
      <button title={title} onClick={onClick} className={`p-1.5 ${color} hover:bg-[#F3F4F5] transition-colors`}>
        {icon}
      </button>
  );
}

function formatEspecie(especie?: string) {
  if (especie === 'CAO') return 'Cão';
  if (especie === 'GATO') return 'Gato';
  return 'Espécie não definida';
}

function formatPorte(porte?: string) {
  if (porte === 'PEQUENO_MEDIO') return 'Pequeno/médio';
  if (porte === 'GRANDE') return 'Grande';
  if (porte === 'NAO_APLICAVEL') return 'Não aplicável';
  return 'Porte não definido';
}
