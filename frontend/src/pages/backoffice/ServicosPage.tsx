import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicoApi } from '../../api/servicoApi';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { formatDate, formatMoney } from '../../utils/formatters';
import type { Servico, ServicoRequest } from '../../types/servico';
import { Plus, Pencil, Loader2, Trash2, CalendarOff, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY: ServicoRequest = { nome: '', descricao: '', preco: 0, capacidadeDiaria: 1 };
const TODAY = new Date().toISOString().split('T')[0];

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

export default function ServicosPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'new' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [form, setForm] = useState<ServicoRequest>(EMPTY);
  const [datas, setDatas] = useState<Record<number, string>>({});

  const { data: servicos = [], isLoading } = useQuery({ queryKey: ['servicos'], queryFn: servicoApi.listarTodos });

  const set = (k: keyof ServicoRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({
        ...f,
        [k]: k === 'preco' ? Number(e.target.value) : k === 'capacidadeDiaria' ? Number(e.target.value) : e.target.value,
      }));

  const refresh = () => qc.invalidateQueries({ queryKey: ['servicos'] });

  const criarM = useMutation({
    mutationFn: servicoApi.criar,
    onSuccess: () => { toast.success('Serviço criado!'); refresh(); setModal(null); },
    onError: (err) => toast.error(getErrorMessage(err, 'Erro ao criar serviço.')),
  });

  const editarM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServicoRequest }) => servicoApi.atualizar(id, data),
    onSuccess: () => { toast.success('Serviço atualizado!'); refresh(); setModal(null); },
    onError: (err) => toast.error(getErrorMessage(err, 'Erro ao atualizar serviço.')),
  });

  const bloquearDataM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: string }) => servicoApi.bloquearData(id, data),
    onSuccess: () => { toast.success('Serviço desativado nessa data.'); refresh(); },
    onError: (err) => toast.error(getErrorMessage(err, 'Erro ao desativar serviço nessa data.')),
  });

  const desbloquearDataM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: string }) => servicoApi.desbloquearData(id, data),
    onSuccess: () => { toast.success('Serviço reativado nessa data.'); refresh(); },
    onError: (err) => toast.error(getErrorMessage(err, 'Erro ao reativar serviço nessa data.')),
  });

  const eliminarM = useMutation({
    mutationFn: servicoApi.remover,
    onSuccess: () => { toast.success('Serviço eliminado.'); refresh(); },
    onError: (err) => toast.error(getErrorMessage(err, 'Erro ao eliminar serviço.')),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === 'new') criarM.mutate(form);
    else if (editing) editarM.mutate({ id: editing.id, data: form });
  };

  const abrirEdicao = (s: Servico) => {
    setEditing(s);
    setForm({ nome: s.nome, descricao: s.descricao, preco: s.preco, capacidadeDiaria: s.capacidadeDiaria });
    setModal('edit');
  };

  const bloquearData = (s: Servico) => {
    const data = datas[s.id] || TODAY;
    bloquearDataM.mutate({ id: s.id, data });
  };

  const columns = [
    { key: 'nome', label: 'Serviço', sortable: true, render: (s: Servico) => <span className="font-medium text-[#041525]">{s.nome}</span> },
    { key: 'descricao', label: 'Descrição', render: (s: Servico) => <span className="text-[#74777D] text-xs line-clamp-2">{s.descricao || '—'}</span> },
    { key: 'preco', label: 'Preço', sortable: true, render: (s: Servico) => <span className="font-bold text-[#775A19]">{formatMoney(s.preco)}</span> },
    { key: 'capacidadeDiaria', label: 'Cap./Dia', render: (s: Servico) => s.capacidadeDiaria ?? 'Sem limite' },
    {
      key: 'datasIndisponiveis',
      label: 'Indisponibilidade por data',
      className: 'min-w-[360px]',
      render: (s: Servico) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                  type="date"
                  min={TODAY}
                  value={datas[s.id] || TODAY}
                  onChange={(e) => setDatas((d) => ({ ...d, [s.id]: e.target.value }))}
                  className="border border-[#C4C6CC] px-2 py-1.5 text-xs focus:outline-none focus:border-[#775A19]"
              />
              <button
                  type="button"
                  onClick={() => bloquearData(s)}
                  disabled={bloquearDataM.isPending}
                  className="inline-flex items-center gap-1 border border-[#C4C6CC] px-2 py-1.5 text-xs font-medium text-[#44474C] hover:bg-[#F9F5EA] hover:border-[#775A19] hover:text-[#775A19] disabled:opacity-50"
              >
                <CalendarOff size={13} /> Desativar nessa data
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(s.datasIndisponiveis ?? []).length === 0 ? (
                  <span className="text-xs text-[#74777D]">Sem datas desativadas</span>
              ) : (
                  (s.datasIndisponiveis ?? []).map((data) => (
                      <span key={data} className="inline-flex items-center gap-1 bg-[#F3F4F5] border border-[#E1E3E4] px-2 py-1 text-xs text-[#44474C]">
                  {formatDate(data)}
                        <button
                            type="button"
                            onClick={() => desbloquearDataM.mutate({ id: s.id, data })}
                            className="text-[#74777D] hover:text-red-600"
                            title="Reativar nessa data"
                        >
                    <X size={11} />
                  </button>
                </span>
                  ))
              )}
            </div>
          </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (s: Servico) => (
          <div className="flex items-center justify-end gap-1">
            <button
                onClick={() => abrirEdicao(s)}
                className="p-1.5 text-[#74777D] hover:text-[#041525] hover:bg-[#F3F4F5]"
                title="Editar serviço"
            >
              <Pencil size={13} />
            </button>
            <button
                onClick={() => { if (confirm(`Eliminar definitivamente o serviço "${s.nome}"?`)) eliminarM.mutate(s.id); }}
                className="p-1.5 text-[#74777D] hover:text-red-700 hover:bg-red-50"
                title="Eliminar serviço"
            >
              <Trash2 size={13} />
            </button>
          </div>
      ),
    },
  ];

  const loading = criarM.isPending || editarM.isPending;

  return (
      <div className="space-y-6">
        <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Catálogo de Serviços' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Catálogo de Serviços</h1>
            <p className="text-sm text-[#74777D] mt-1">Gerir serviços, desativar por data e eliminar serviços do catálogo.</p>
          </div>
          <button onClick={() => { setForm(EMPTY); setEditing(null); setModal('new'); }} className="flex items-center justify-center gap-2 bg-[#775A19] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-[#5d4201]">
            <Plus size={14} /> Novo Serviço
          </button>
        </div>

        <DataTable data={servicos} columns={columns} searchKeys={['nome', 'descricao']} loading={isLoading} emptyMessage="Sem serviços" />

        <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'new' ? 'Novo Serviço' : 'Editar Serviço'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[{ k: 'nome', label: 'Nome', type: 'text', ph: 'Ex: Banho & Tosquia' }, { k: 'preco', label: 'Preço (€)', type: 'number', ph: '25.00' }, { k: 'capacidadeDiaria', label: 'Capacidade diária', type: 'number', ph: '5' }].map(({ k, label, type, ph }) => (
                <div key={k}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">{label} *</label>
                  <input type={type} min={k === 'preco' ? '0' : '1'} step={k === 'preco' ? '0.01' : '1'} className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]" placeholder={ph} value={(form as any)[k]} onChange={set(k as any)} required />
                </div>
            ))}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Descrição</label>
              <textarea rows={3} className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19] resize-none" value={form.descricao} onChange={set('descricao')} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 border border-[#C4C6CC] py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5]">Cancelar</button>
              <button type="submit" disabled={loading} className="flex-1 bg-[#775A19] text-white py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#5d4201] disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />}{modal === 'new' ? 'Criar' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
  );
}
