import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { reservaApi } from '../../api/reservaApi';
import { animalApi } from '../../api/animalApi';
import { servicoApi } from '../../api/servicoApi';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { EstadoBadge } from '../../components/ui/Badge';
import { formatDate, formatMoney } from '../../utils/formatters';
import type { Reserva, ReservaRequest } from '../../types/reserva';
import type { Animal, AnimalRequest, Especie, Porte } from '../../types/animal';
import type { AdicionarServicoReservaRequest, Servico } from '../../types/servico';
import { Plus, Loader2, X, ArrowLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { DatePicker } from '../../components/ui/DatePicker';

type SelectedServico = AdicionarServicoReservaRequest;

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

function getErrorMessage(err: unknown, fallback: string) {
  if (
      typeof err === 'object' &&
      err !== null &&
      'response' in err &&
      typeof (err as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
}

export default function ReservasPage() {
  const { utilizador } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState('ativas');
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1=Animal, 2=Datas, 3=Serviços
  const [form, setForm] = useState<ReservaRequest>({ animalId: 0, dataInicio: '', dataFim: '' });
  const [selectedServicos, setSelectedServicos] = useState<SelectedServico[]>([]);
  const [novoAnimalAberto, setNovoAnimalAberto] = useState(false);
  const [novoAnimal, setNovoAnimal] = useState<AnimalRequest>({
    nome: '', especie: 'CAO', porte: 'PEQUENO_MEDIO',
    raca: '', dataNascimento: '', observacoes: '',
  });

  const reservasKey = ['reservas', 'proprietario', utilizador!.id] as const;
  const animaisKey = ['animais', 'proprietario', utilizador!.id] as const;

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: reservasKey,
    queryFn: () => reservaApi.listarPorProprietario(utilizador!.id),
  });

  const { data: animais = [] } = useQuery({
    queryKey: animaisKey,
    queryFn: () => animalApi.listarPorProprietario(utilizador!.id),
    enabled: modalOpen,
  });

  const { data: servicos = [], isLoading: servicosLoading } = useQuery({
    queryKey: ['servicos', 'disponiveis'],
    queryFn: () => servicoApi.listarDisponiveis(),
    enabled: modalOpen && step === 3,
  });

  const setNA = (k: keyof AnimalRequest) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
          setNovoAnimal((f) => ({ ...f, [k]: e.target.value }));

  const selectedAnimal = animais.find((a) => a.id === form.animalId);

  const { data: disponibilidade, isFetching: loadingDisponibilidade } = useQuery({
    queryKey: ['reservas', 'disponibilidade', selectedAnimal?.especie, selectedAnimal?.porte, form.dataInicio, form.dataFim],
    queryFn: () => reservaApi.disponibilidade(selectedAnimal!.especie, selectedAnimal!.porte, form.dataInicio, form.dataFim),
    enabled: modalOpen && step === 2 && !!selectedAnimal && !!form.dataInicio && !!form.dataFim,
    retry: false,
  });

  const podeAvancarDatas = !!form.dataInicio && !!form.dataFim && !loadingDisponibilidade && !!disponibilidade?.disponivel;

  const servicoPorId = (id: number) => servicos.find((s) => s.id === id);
  const servicoEstaIndisponivelNaData = (s: Servico, data: string) => !!data && (s.datasIndisponiveis ?? []).includes(data);
  const selectedComErro = selectedServicos.some((ss) => {
    const s = servicoPorId(ss.servicoId);
    return !s || !ss.dataExecucao || servicoEstaIndisponivelNaData(s, ss.dataExecucao);
  });

  const criarMutation = useMutation({
    mutationFn: async (data: ReservaRequest) => {
      const r = await reservaApi.criar(data);
      for (const s of selectedServicos) {
        await servicoApi.adicionarAReserva(r.id, s);
      }
      return r;
    },
    onSuccess: (novaReserva) => {
      toast.success('Reserva criada com sucesso!');
      qc.setQueryData<Reserva[]>(reservasKey, (old) => {
        const lista: Reserva[] = old ?? [];
        return [novaReserva, ...lista.filter((r) => r.id !== novaReserva.id)];
      });
      qc.invalidateQueries({ queryKey: ['reservas'] });
      setTab('ativas');
      setModalOpen(false);
      resetModal();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Erro ao criar reserva.')),
  });

  const cancelarMutation = useMutation({
    mutationFn: (id: number) => reservaApi.cancelar(id),
    onSuccess: () => { toast.success('Reserva cancelada.'); qc.invalidateQueries({ queryKey: ['reservas'] }); },
    onError: (err) => toast.error(getErrorMessage(err, 'Não foi possível cancelar.')),
  });

  const criarAnimalMutation = useMutation({
    mutationFn: (data: AnimalRequest) => animalApi.criar(utilizador!.id, data),
    onSuccess: (animalCriado) => {
      toast.success('Animal registado!');
      qc.setQueryData<Animal[]>(animaisKey, (old) => {
        const lista: Animal[] = old ?? [];
        return [animalCriado, ...lista.filter((a) => a.id !== animalCriado.id)];
      });
      qc.invalidateQueries({ queryKey: animaisKey });
      setForm((f) => ({ ...f, animalId: animalCriado.id }));
      setNovoAnimalAberto(false);
      setNovoAnimal({ nome: '', especie: 'CAO', porte: 'PEQUENO_MEDIO', raca: '', dataNascimento: '', observacoes: '' });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Erro ao registar animal.')),
  });

  const handleCriarAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    const porte: Porte = novoAnimal.especie === 'GATO' ? 'NAO_APLICAVEL' : novoAnimal.porte;
    criarAnimalMutation.mutate({ ...novoAnimal, porte });
  };

  const resetModal = () => {
    setStep(1);
    setForm({ animalId: 0, dataInicio: '', dataFim: '' });
    setSelectedServicos([]);
    setNovoAnimalAberto(false);
  };

  const ativas = reservas.filter((r) => !['CONCLUIDA', 'CANCELADA'].includes(r.estado));
  const historico = reservas.filter((r) => ['CONCLUIDA', 'CANCELADA'].includes(r.estado));
  const shown = tab === 'ativas' ? ativas : historico;

  const toggleServico = (id: number) => {
    setSelectedServicos((prev) =>
        prev.find((s) => s.servicoId === id)
            ? prev.filter((s) => s.servicoId !== id)
            : [...prev, { servicoId: id, dataExecucao: form.dataInicio || todayIso() }]
    );
  };

  const alterarDataServico = (id: number, dataExecucao: string) => {
    setSelectedServicos((prev) => prev.map((s) => s.servicoId === id ? { ...s, dataExecucao } : s));
  };

  return (
      <div>
        <div className="flex items-end justify-between gap-4 border-b border-[#E7E8E9] pb-5">
          <div>
            <h1 className="font-noto-serif text-2xl text-[#041525]">As Minhas Reservas</h1>
            <p className="text-sm text-[#74777D] mt-1">
              {ativas.length === 0
                  ? 'Sem reservas ativas'
                  : `${ativas.length} reserva${ativas.length !== 1 ? 's' : ''} ativa${ativas.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
              onClick={() => { resetModal(); setModalOpen(true); }}
              className="inline-flex items-center gap-2 bg-[#041525] text-white text-sm font-medium px-4 py-2.5 hover:bg-slate-800 transition-colors rounded-sm"
          >
            <Plus size={16} /> Nova reserva
          </button>
        </div>

        <Tabs
            tabs={[
              { id: 'ativas', label: 'Ativas', count: ativas.length },
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
                  <div key={r.id} className="bg-white border border-[#C4C6CC] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#775A19] hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#D3E4FA] text-[#041525] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>pets</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#041525]">{r.animalNome ?? `Animal #${r.animalId}`}</p>
                        <p className="text-xs text-[#74777D] mt-0.5">
                          {formatDate(r.dataInicio)} → {formatDate(r.dataFim)}
                          {r.codigoEspaco && <span className="ml-2 text-[#74777D]">· Espaço {r.codigoEspaco}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-[#041525]">{formatMoney(r.totalComServicos ?? r.precoBase)}</p>
                      <EstadoBadge estado={r.estado} />
                      {r.estado === 'PENDENTE' && (
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

        <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetModal(); }} title="Nova Reserva" size="xl">
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

          {step === 1 && (
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="space-y-3">
                  <p className="text-sm text-[#44474C] mb-2">
                    {animais.length === 0
                        ? 'Ainda não tem nenhum animal registado. Registe um para continuar:'
                        : 'Selecione o animal para a reserva:'}
                  </p>

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
                        <span className="text-xs text-[#74777D]">{a.especie === 'CAO' ? 'Cão' : 'Gato'}{a.raca ? ` · ${a.raca}` : ''}</span>
                      </div>
                  ))}

                  <button
                      type="button"
                      onClick={() => setNovoAnimalAberto(true)}
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-[#C4C6CC] hover:border-[#775A19] hover:bg-[#F9F5EA] text-sm text-[#44474C] hover:text-[#775A19] py-3 transition-colors"
                  >
                    <Plus size={14} /> Registar novo animal
                  </button>

                  <div className="flex justify-end pt-2">
                    <button
                        onClick={() => form.animalId && setStep(2)}
                        disabled={!form.animalId}
                        className="bg-[#041525] text-white px-6 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-40 transition-colors"
                    >
                      Continuar
                    </button>
                  </div>
                </div>

                <div className="border border-[#E7E8E9] bg-[#F9FAFB] p-4">
                  {!novoAnimalAberto ? (
                      <div className="h-full flex flex-col justify-center text-sm text-[#74777D]">
                        <p className="font-medium text-[#041525] mb-2">Animal novo?</p>
                        <p>Use o botão “Registar novo animal” para criar a ficha sem sair da reserva. O animal fica imediatamente selecionado.</p>
                      </div>
                  ) : (
                      <form onSubmit={handleCriarAnimal} className="space-y-4">
                        <button
                            type="button"
                            onClick={() => setNovoAnimalAberto(false)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#44474C] hover:text-[#041525] transition-colors"
                        >
                          <ArrowLeft size={12} /> Voltar à lista
                        </button>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Nome *</label>
                          <input className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]" value={novoAnimal.nome} onChange={setNA('nome')} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Espécie *</label>
                            <select
                                className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19] bg-white"
                                value={novoAnimal.especie}
                                onChange={(e) => setNovoAnimal((f) => ({
                                  ...f,
                                  especie: e.target.value as Especie,
                                  porte: e.target.value === 'GATO' ? 'NAO_APLICAVEL' : (f.porte === 'NAO_APLICAVEL' ? 'PEQUENO_MEDIO' : f.porte),
                                }))}
                            >
                              <option value="CAO">Cão</option>
                              <option value="GATO">Gato</option>
                            </select>
                          </div>
                          {novoAnimal.especie === 'CAO' && (
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Porte *</label>
                                <select className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19] bg-white" value={novoAnimal.porte} onChange={setNA('porte')}>
                                  <option value="PEQUENO_MEDIO">Pequeno/Médio</option>
                                  <option value="GRANDE">Grande</option>
                                </select>
                              </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Raça</label>
                          <input className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]" value={novoAnimal.raca} onChange={setNA('raca')} />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Data de Nascimento</label>
                          <input type="date" className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]" value={novoAnimal.dataNascimento} onChange={setNA('dataNascimento')} />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Observações</label>
                          <textarea rows={3} className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19] resize-none" value={novoAnimal.observacoes ?? ''} onChange={setNA('observacoes')} placeholder="Alergias, medicação, comportamento, comida preferida, rotinas..." />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setNovoAnimalAberto(false)} className="flex-1 border border-[#C4C6CC] py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5] transition-colors">Cancelar</button>
                          <button type="submit" disabled={criarAnimalMutation.isPending} className="flex-1 bg-[#775A19] text-white py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#5d4201] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                            {criarAnimalMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                            Registar
                          </button>
                        </div>
                      </form>
                  )}
                </div>
              </div>
          )}

          {step === 2 && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <p className="text-sm text-[#44474C] mb-4">Selecione as datas de entrada e saída:</p>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <DatePicker value={form.dataInicio} onChange={(d) => setForm((f) => ({ ...f, dataInicio: d, dataFim: f.dataFim && f.dataFim < d ? '' : f.dataFim }))} min={todayIso()} />
                  </div>
                  <div>
                    <DatePicker value={form.dataFim} onChange={(d) => setForm((f) => ({ ...f, dataFim: d }))} min={form.dataInicio || todayIso()} />
                  </div>
                </div>
                {form.dataInicio && form.dataFim && (
                    <div className={`p-3 text-sm border ${disponibilidade?.disponivel ? 'bg-green-50 border-green-200 text-green-800' : disponibilidade ? 'bg-red-50 border-red-200 text-red-800' : 'bg-[#F3F4F5] border-[#E7E8E9] text-[#44474C]'}`}>
                      {loadingDisponibilidade ? (
                          <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> A verificar disponibilidade...</span>
                      ) : disponibilidade?.disponivel ? (
                          <>Disponível · {disponibilidade.espacosLivres} espaço{disponibilidade.espacosLivres !== 1 ? 's' : ''} livre{disponibilidade.espacosLivres !== 1 ? 's' : ''} · Preço estimado: {formatMoney(disponibilidade.precoEstimado)}</>
                      ) : disponibilidade ? (
                          <>Sem disponibilidade para estas datas e para o tipo de animal selecionado.</>
                      ) : (
                          <>Indique datas válidas para verificar disponibilidade.</>
                      )}
                    </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="border border-[#C4C6CC] px-6 py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5] transition-colors">Voltar</button>
                  <button onClick={() => podeAvancarDatas && setStep(3)} disabled={!podeAvancarDatas} className="flex-1 bg-[#041525] text-white px-6 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-40 transition-colors">
                    Continuar
                  </button>
                </div>
              </div>
          )}

          {step === 3 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#44474C]">Selecione serviços adicionais e defina a data de execução de cada um.</p>
                  <p className="text-xs text-[#74777D] mt-1">Agora a disponibilidade do serviço é controlada por data, não por um botão geral de on/off.</p>
                </div>

                {servicosLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#775A19]" size={24} /></div>
                ) : servicos.length === 0 ? (
                    <div className="border border-dashed border-[#C4C6CC] p-8 text-center text-sm text-[#74777D]">Não existem serviços complementares disponíveis.</div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pr-1">
                      {servicos.map((s) => {
                        const selected = selectedServicos.find((x) => x.servicoId === s.id);
                        const dataExecucao = selected?.dataExecucao || form.dataInicio;
                        const indisponivel = selected ? servicoEstaIndisponivelNaData(s, dataExecucao) : false;
                        return (
                            <div key={s.id} className={`border p-4 transition-colors ${selected ? 'border-[#775A19] bg-[#FDD587]/10' : 'border-[#E7E8E9] hover:border-[#775A19]/40'}`}>
                              <div className="flex items-start gap-3">
                                <input type="checkbox" className="mt-1 accent-[#775A19]" checked={!!selected} onChange={() => toggleServico(s.id)} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="font-medium text-[#041525] text-sm">{s.nome}</p>
                                    <p className="font-bold text-[#775A19] text-sm whitespace-nowrap">{formatMoney(s.preco)}</p>
                                  </div>
                                  {s.descricao && <p className="text-xs text-[#74777D] mt-0.5 line-clamp-2">{s.descricao}</p>}
                                  {selected && (
                                      <div className="mt-3 space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C]">Data do serviço</label>
                                        <input
                                            type="date"
                                            min={form.dataInicio}
                                            max={form.dataFim}
                                            value={dataExecucao}
                                            onChange={(e) => alterarDataServico(s.id, e.target.value)}
                                            className={`w-full border px-3 py-2 text-sm focus:outline-none ${indisponivel ? 'border-red-400 bg-red-50' : 'border-[#C4C6CC] focus:border-[#775A19]'}`}
                                        />
                                        {indisponivel && <p className="text-xs text-red-700">Este serviço está desativado nessa data. Escolha outra data.</p>}
                                      </div>
                                  )}
                                </div>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                )}

                {selectedServicos.length > 0 && (
                    <div className="bg-[#F3F4F5] p-3 text-sm font-medium text-[#44474C]">
                      {selectedServicos.length} serviço{selectedServicos.length !== 1 ? 's' : ''} selecionado{selectedServicos.length !== 1 ? 's' : ''}
                    </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(2)} className="border border-[#C4C6CC] px-6 py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5] transition-colors">Voltar</button>
                  <button
                      onClick={() => criarMutation.mutate(form)}
                      disabled={criarMutation.isPending || selectedComErro}
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
