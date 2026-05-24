import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservaApi } from '../../api/reservaApi';
import { espacoApi } from '../../api/espacoApi';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { DataTable } from '../../components/ui/DataTable';
import { EstadoBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';
import type { Reserva } from '../../types/reserva';
import type { EspacoAlojamento } from '../../types/espaco';
import { LogIn, LogOut, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckInPage() {
  const qc = useQueryClient();
  const [checkinModal, setCheckinModal] = useState<Reserva | null>(null);
  const [espacoId, setEspacoId] = useState('');

  const { data: reservas = [], isLoading } = useQuery<Reserva[]>({
    queryKey: ['reservas', 'todas'],
    queryFn: reservaApi.listarTodas,
  });

  const pendentes = reservas.filter((r: Reserva) => r.estado === 'PENDENTE');
  const emEstadia = reservas.filter((r: Reserva) => r.estado === 'EM_ESTADIA');

  const podeConsultarEspacos = Boolean(
    checkinModal?.animalEspecie && checkinModal?.animalPorte && checkinModal?.dataInicio && checkinModal?.dataFim,
  );

  const { data: espacosDisponiveis = [], isLoading: loadingEspacos, isError: erroEspacos } = useQuery<EspacoAlojamento[]>({
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

  const columnsPendentes = [
    { key: 'id', label: '#', sortable: true, render: (r: Reserva) => <span className="text-xs text-[#74777D] font-mono">#{r.id}</span> },
    { key: 'animalNome', label: 'Animal', sortable: true, render: (r: Reserva) => <span className="font-medium text-[#041525]">{r.animalNome ?? `#${r.animalId}`}</span> },
    { key: 'proprietarioNome', label: 'Proprietário', sortable: true, render: (r: Reserva) => r.proprietarioNome ?? '—' },
    { key: 'dataInicio', label: 'Entrada', sortable: true, render: (r: Reserva) => formatDate(r.dataInicio) },
    { key: 'dataFim', label: 'Saída', sortable: true, render: (r: Reserva) => formatDate(r.dataFim) },
    { key: 'estado', label: 'Estado', render: (r: Reserva) => <EstadoBadge estado={r.estado} /> },
    {
      key: 'actions', label: 'Ações', className: 'w-36',
      render: (r: Reserva) => (
        <button onClick={() => abrirCheckin(r)} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-700 hover:text-green-900">
          <LogIn size={14} /> Check-in
        </button>
      ),
    },
  ];

  const columnsEstadia = [
    { key: 'id', label: '#', sortable: true, render: (r: Reserva) => <span className="text-xs text-[#74777D] font-mono">#{r.id}</span> },
    { key: 'animalNome', label: 'Animal', sortable: true, render: (r: Reserva) => <span className="font-medium text-[#041525]">{r.animalNome ?? `#${r.animalId}`}</span> },
    { key: 'codigoEspaco', label: 'Espaço', render: (r: Reserva) => r.codigoEspaco ? <span className="font-mono text-xs bg-[#F3F4F5] px-1.5 py-0.5 border border-[#C4C6CC]">{r.codigoEspaco}</span> : '—' },
    { key: 'dataInicio', label: 'Entrada', sortable: true, render: (r: Reserva) => formatDate(r.dataInicio) },
    { key: 'dataFim', label: 'Saída prevista', sortable: true, render: (r: Reserva) => formatDate(r.dataFim) },
    { key: 'estado', label: 'Estado', render: (r: Reserva) => <EstadoBadge estado={r.estado} /> },
    {
      key: 'actions', label: 'Ações', className: 'w-36',
      render: (r: Reserva) => (
        <button
          onClick={() => { if (confirm('Registar check-out desta estadia?')) checkoutM.mutate(r.id); }}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-700 hover:text-purple-900"
        >
          <LogOut size={14} /> Check-out
        </button>
      ),
    },
  ];

  const espacoSelecionado = espacosDisponiveis.find((e: EspacoAlojamento) => String(e.id) === espacoId);

  return (
    <div className="space-y-8">
      <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Check-in / Check-out' }]} />
      <div>
        <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Check-in / Check-out</h1>
        <p className="text-sm text-[#44474C] mt-1">Gestão operacional das entradas e saídas dos animais.</p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#041525]">Reservas pendentes para check-in</h2>
          <span className="text-xs text-[#74777D]">{pendentes.length} pendente{pendentes.length !== 1 ? 's' : ''}</span>
        </div>
        <DataTable data={pendentes} columns={columnsPendentes} searchKeys={['animalNome', 'proprietarioNome']} loading={isLoading} emptyMessage="Sem reservas pendentes" />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#041525]">Estadias ativas para check-out</h2>
          <span className="text-xs text-[#74777D]">{emEstadia.length} em estadia</span>
        </div>
        <DataTable data={emEstadia} columns={columnsEstadia} searchKeys={['animalNome', 'codigoEspaco']} loading={isLoading} emptyMessage="Sem estadias ativas" />
      </section>

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
                  Não foi possível carregar os espaços disponíveis.
                </div>
              )}

              {!loadingEspacos && !erroEspacos && !podeConsultarEspacos && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">
                  Esta reserva não contém espécie/porte do animal. Confirme o DTO de reserva no backend.
                </div>
              )}

              {!loadingEspacos && !erroEspacos && podeConsultarEspacos && espacosDisponiveis.length === 0 && (
                <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 p-3">
                  Não existem espaços compatíveis e livres para esta reserva.
                </div>
              )}

              {!loadingEspacos && espacosDisponiveis.length > 0 && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {espacosDisponiveis.map((espaco: EspacoAlojamento) => (
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
                Espaço selecionado: <strong>{espacoSelecionado.codigo}</strong>. Ao confirmar, a reserva passa para <strong>EM_ESTADIA</strong>.
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
