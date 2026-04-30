import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicoApi } from '../../api/servicoApi';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Toggle } from '../../components/ui/Toggle';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { formatMoney } from '../../utils/formatters';
import type { Servico, ServicoRequest } from '../../types/servico';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY: ServicoRequest = { nome: '', descricao: '', preco: 0, capacidadeDiaria: 1 };

export default function ServicosPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'new' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [form, setForm] = useState<ServicoRequest>(EMPTY);

  const { data: servicos = [], isLoading } = useQuery({ queryKey: ['servicos'], queryFn: servicoApi.listarTodos });

  const set = (k: keyof ServicoRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: k === 'preco' || k === 'capacidadeDiaria' ? parseFloat(e.target.value) : e.target.value }));

  const criarM = useMutation({ mutationFn: servicoApi.criar, onSuccess: () => { toast.success('Serviço criado!'); qc.invalidateQueries({ queryKey: ['servicos'] }); setModal(null); } });
  const editarM = useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => servicoApi.atualizar(id, data), onSuccess: () => { toast.success('Serviço atualizado!'); qc.invalidateQueries({ queryKey: ['servicos'] }); setModal(null); } });
  const toggleM = useMutation({ mutationFn: servicoApi.toggleDisponivel, onSuccess: () => qc.invalidateQueries({ queryKey: ['servicos'] }) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === 'new') criarM.mutate(form);
    else if (editing) editarM.mutate({ id: editing.id, data: form });
  };

  const columns = [
    { key: 'nome',           label: 'Serviço',    sortable: true, render: (s: Servico) => <span className="font-medium text-[#041525]">{s.nome}</span> },
    { key: 'descricao',      label: 'Descrição',  render: (s: Servico) => <span className="text-[#74777D] text-xs line-clamp-1">{s.descricao}</span> },
    { key: 'preco',          label: 'Preço',      sortable: true, render: (s: Servico) => <span className="font-bold text-[#775A19]">{formatMoney(s.preco)}</span> },
    { key: 'capacidadeDiaria', label: 'Cap./Dia', render: (s: Servico) => s.capacidadeDiaria },
    { key: 'disponivel', label: 'Ativo', render: (s: Servico) => (
      <Toggle checked={s.disponivel} onChange={() => toggleM.mutate(s.id)} />
    )},
    { key: 'actions', label: '', render: (s: Servico) => (
      <button onClick={() => { setEditing(s); setForm({ nome: s.nome, descricao: s.descricao, preco: s.preco, capacidadeDiaria: s.capacidadeDiaria }); setModal('edit'); }}
        className="p-1.5 text-[#74777D] hover:text-[#041525] hover:bg-[#F3F4F5]"><Pencil size={13} /></button>
    )},
  ];

  const loading = criarM.isPending || editarM.isPending;

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Catálogo de Serviços' }]} />
      <div className="flex items-center justify-between">
        <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Catálogo de Serviços</h1>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setModal('new'); }} className="flex items-center gap-2 bg-[#775A19] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-[#5d4201]">
          <Plus size={14} /> Novo Serviço
        </button>
      </div>
      <DataTable data={servicos} columns={columns} searchKeys={['nome', 'descricao']} loading={isLoading} emptyMessage="Sem serviços" />
      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'new' ? 'Novo Serviço' : 'Editar Serviço'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[{ k: 'nome', label: 'Nome', type: 'text', ph: 'Ex: Banho & Tosquia' }, { k: 'preco', label: 'Preço (€)', type: 'number', ph: '25.00' }, { k: 'capacidadeDiaria', label: 'Capacidade diária', type: 'number', ph: '5' }].map(({ k, label, type, ph }) => (
            <div key={k}>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">{label} *</label>
              <input type={type} step={k === 'preco' ? '0.01' : '1'} className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]" placeholder={ph} value={(form as any)[k]} onChange={set(k as any)} required />
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
