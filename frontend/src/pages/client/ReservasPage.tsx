import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { reservaApi } from '../../api/reservaApi';
import { animalApi } from '../../api/animalApi';
import { servicoApi } from '../../api/servicoApi';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { EstadoBadge } from '../../components/ui/Badge';
import { Toggle } from '../../components/ui/Toggle';
import { formatDate, formatMoney } from '../../utils/formatters';
import type { ReservaRequest } from '../../types/reserva';
import { Plus, Calendar, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { DatePicker } from '../../components/ui/DatePicker';
export default function ReservasPage() {
  const { utilizador } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState('ativas');
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1=Animal, 2=Datas, 3=Serviços
  const [form, setForm] = useState<ReservaRequest>({ animalId: 0, dataInicio: '', dataFim: '' });
  const [selectedServicos, setSelectedServicos] = useState<{ servicoId: number; dataExecucao: string }[]>([]);

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['reservas', 'proprietario', utilizador!.id],
    queryFn: () => reservaApi.listarPorProprietario(utilizador!.id),
  });

  const { data: animais = [] } = useQuery({
    queryKey: ['animais', 'proprietario', utilizador!.id],
    queryFn: () => animalApi.listarPorProprietario(utilizador!.id),
    enabled: modalOpen,
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos', 'disponiveis'],
    queryFn: servicoApi.listarDisponiveis,
    enabled: modalOpen && step === 3,
  });

  const criarMutation = useMutation({
    mutationFn: async (data: ReservaRequest) => {
      const r = await reservaApi.criar(data);
      for (const s of selectedServicos) {
        await servicoApi.adicionarAReserva(r.id, s);
      }
      return r;
    },
    onSuccess: () => {
      toast.success('Reserva criada com sucesso!');
      qc.invalidateQueries({ queryKey: ['reservas'] });
      setModalOpen(false);
      resetModal();
    },
    onError: () => toast.error('Erro ao criar reserva.'),
  });

  const cancelarMutation = useMutation({
    mutationFn: (id: number) => reservaApi.cancelar(id),
    onSuccess: () => { toast.success('Reserva cancelada.'); qc.invalidateQueries({ queryKey: ['reservas'] }); },
    onError: () => toast.error('Não foi possível cancelar.'),
  });

  const resetModal = () => { setStep(1); setForm({ animalId: 0, dataInicio: '', dataFim: '' }); setSelectedServicos([]); };

  const ativas = reservas.filter((r) => ['PENDENTE', 'CONFIRMADA', 'EM_ESTADIA'].includes(r.estado));
  const historico = reservas.filter((r) => ['CONCLUIDA', 'CANCELADA'].includes(r.estado));
  const shown = tab === 'ativas' ? ativas : historico;

  const toggleServico = (id: number, date: string) => {
    setSelectedServicos((prev) =>
      prev.find((s) => s.servicoId === id)
        ? prev.filter((s) => s.servicoId !== id)
        : [...prev, { servicoId: id, dataExecucao: date || form.dataInicio }]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">As Minhas Reservas</h1>
          <p className="text-sm text-[#44474C] mt-1">{ativas.length} reserva{ativas.length !== 1 ? 's' : ''} ativa{ativas.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { resetModal(); setModalOpen(true); }} className="flex items-center gap-2 bg-[#775A19] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-[#5d4201] transition-colors">
          <Plus size={14} /> Nova Reserva
        </button>
      </div>

      <Tabs
        tabs={[
          { id: 'ativas',   label: 'Ativas',   count: ativas.length },
          { id: 'historico', label: 'Histórico', count: historico.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#775A19]" size={28} /></div>
      ) : shown.length === 0 ? (
        <div className="border border-dashed border-[#C4C6CC] p-12 text-center bg-white">
          <Calendar size={40} className="text-[#C4C6CC] mx-auto mb-3" />
          <p className="text-[#44474C] font-medium">Sem reservas {tab === 'ativas' ? 'ativas' : 'no histórico'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => (
            <div key={r.id} className="bg-white border border-[#C4C6CC] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#044747C] hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#D3E4FA] text-[#041525] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>pets</span>
                </div>
                <div>
                  <p className="font-semibold text-[#041525]">{r.animalNome ?? `Animal #${r.animalId}`}</p>
                  <p className="text-xs text-[#74777D] mt-0.5">
                    {formatDate(r.dataInicio)} → {formatDate(r.dataFim)}
                    {r.espacoCodigo && <span className="ml-2 text-[#74777D]">· Espaço {r.espacoCodigo}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {r.servicos?.length > 0 && (
                  <span className="text-xs text-[#74777D]">{r.servicos.length} serviço{r.servicos.length !== 1 ? 's' : ''}</span>
                )}
                <p className="font-bold text-[#041525]">{formatMoney(r.precoBase)}</p>
                <EstadoBadge estado={r.estado} />
                {(r.estado === 'PENDENTE' || r.estado === 'CONFIRMADA') && (
                  <button
                    onClick={() => { if (confirm('Cancelar esta reserva?')) cancelarMutation.mutate(r.id); }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors flex items-center gap-1"
                  >
                    <X size={12} /> Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wizard Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetModal(); }} title="Nova Reserva" size="lg">
        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-8">
          {['Animal', 'Datas', 'Serviços'].map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${done ? 'bg-[#775A19] border-[#775A19] text-white' : active ? 'border-[#775A19] text-[#775A19]' : 'border-[#C4C6CC] text-[#74777D]'}`}>
                    {done ? '✓' : n}
                  </div>
                  <span className={`text-xs mt-1 ${active ? 'text-[#775A19] font-semibold' : 'text-[#74777D]'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px mx-2 mb-4 ${done ? 'bg-[#775A19]' : 'bg-[#C4C6CC]'}`} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Escolher animal */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-[#44474C] mb-4">Selecione o animal para a reserva:</p>
            {animais.map((a) => (
              <div
                key={a.id}
                onClick={() => setForm((f) => ({ ...f, animalId: a.id }))}
                className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${form.animalId === a.id ? 'border-[#775A19] bg-[#FDD587]/10' : 'border-[#C4C6CC] hover:border-[#775A19]/50'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.animalId === a.id ? 'border-[#775A19]' : 'border-[#C4C6CC]'}`}>
                  {form.animalId === a.id && <div className="w-2.5 h-2.5 rounded-full bg-[#775A19]" />}
                </div>
                <p className="font-medium text-[#041525]">{a.nome}</p>
                <span className="text-xs text-[#74777D]">{a.especie === 'CAO' ? 'Cão' : 'Gato'} · {a.raca}</span>
              </div>
            ))}
            {animais.length === 0 && <p className="text-sm text-[#74777D] text-center py-4">Registe um animal primeiro.</p>}
            <div className="flex justify-end pt-2">
              <button onClick={() => step === 1 && form.animalId && setStep(2)} disabled={!form.animalId} className="bg-[#041525] text-white px-6 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-40 transition-colors">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Datas */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#44474C] mb-4">Selecione as datas de entrada e saída:</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Check-in *</label>
                <DatePicker label="Check-in *" value={form.dataInicio} onChange={(d) => setForm(f => ({...f, dataInicio: d}))} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Check-out *</label>
                <DatePicker label="Check-out *" value={form.dataFim} onChange={(d) => setForm(f => ({...f, dataFim: d}))} min={form.dataInicio || new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            {form.dataInicio && form.dataFim && (
              <div className="bg-[#F3F4F5] p-3 text-sm text-[#44474C]">
                Duração estimada: {Math.ceil((new Date(form.dataFim).getTime() - new Date(form.dataInicio).getTime()) / 86400000)} dia(s) · {formatMoney(25 * Math.ceil((new Date(form.dataFim).getTime() - new Date(form.dataInicio).getTime()) / 86400000))} (tarifa base)
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="border border-[#C4C6CC] px-6 py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5] transition-colors">Voltar</button>
              <button onClick={() => form.dataInicio && form.dataFim && setStep(3)} disabled={!form.dataInicio || !form.dataFim} className="flex-1 bg-[#041525] text-white px-6 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-40 transition-colors">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Serviços */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-[#44474C] mb-4">Selecione serviços adicionais (opcional):</p>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {servicos.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <Toggle
                    checked={!!selectedServicos.find(x => x.servicoId === s.id)}
                    onChange={() => toggleServico(s.id, form.dataInicio)}
                    label={s.nome}
                    description={s.descricao}
                    icon="spa"
                  />
                  <p className="font-bold text-[#775A19] text-sm ml-4">{formatMoney(s.preco)}</p>
                </div>
              ))}
            </div>
            {selectedServicos.length > 0 && (
              <div className="bg-[#F3F4F5] p-3 text-sm font-medium text-[#044747C]">
                {selectedServicos.length} serviço{selectedServicos.length !== 1 ? 's' : ''} selecionado{selectedServicos.length !== 1 ? 's' : ''}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="border border-[#C4C6CC] px-6 py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5] transition-colors">Voltar</button>
              <button
                onClick={() => criarMutation.mutate(form)}
                disabled={criarMutation.isPending}
                className="flex-1 bg-[#775A19] text-white px-6 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#5d4201] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {criarMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Confirmar Reserva
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
