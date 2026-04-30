import { Select } from '../../components/ui/Select';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { animalApi } from '../../api/animalApi';
import { Modal } from '../../components/ui/Modal';
import { EspecieBadge, PorteBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import type { Animal, AnimalRequest, Porte, Especie } from '../../types/animal';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY: AnimalRequest = {
  nome: '', especie: 'CAO', porte: 'PEQUENO_MEDIO',
  raca: '', dataNascimento: '', observacoes: '',
};

export default function AnimaisPage() {
  const { utilizador } = useAuthStore();
  const qc = useQueryClient();
  const [modal, setModal] = useState<'new' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Animal | null>(null);
  const [form, setForm] = useState<AnimalRequest>(EMPTY);

  const { data: animais = [], isLoading } = useQuery({
    queryKey: ['animais', 'proprietario', utilizador!.id],
    queryFn: () => animalApi.listarPorProprietario(utilizador!.id),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['animais', 'proprietario', utilizador!.id] });

  const criarMutation = useMutation({
    mutationFn: (data: AnimalRequest) => animalApi.criar(utilizador!.id, data),
    onSuccess: () => { toast.success('Animal registado!'); invalidate(); closeModal(); },
    onError: () => toast.error('Erro ao registar animal.'),
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AnimalRequest> }) => animalApi.atualizar(id, data),
    onSuccess: () => { toast.success('Animal atualizado!'); invalidate(); closeModal(); },
    onError: () => toast.error('Erro ao atualizar animal.'),
  });

  const openNew = () => { setForm(EMPTY); setEditing(null); setModal('new'); };
  const openEdit = (a: Animal) => {
    setEditing(a);
    setForm({ nome: a.nome, especie: a.especie, porte: a.porte, raca: a.raca, dataNascimento: a.dataNascimento, observacoes: a.observacoes });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const set = (k: keyof AnimalRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const porte: Porte = form.especie === 'GATO' ? 'NAO_APLICAVEL' : form.porte;
    if (modal === 'new') criarMutation.mutate({ ...form, porte });
    else if (editing) editarMutation.mutate({ id: editing.id, data: { ...form, porte } });
  };

  const loading = criarMutation.isPending || editarMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Os Meus Animais</h1>
          <p className="text-sm text-[#44474C] mt-1">{animais.length} animal{animais.length !== 1 ? 'is' : ''} registado{animais.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#775A19] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-[#5d4201] transition-colors">
          <Plus size={14} /> Novo Animal
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#775A19]" size={28} /></div>
      ) : animais.length === 0 ? (
        <div className="border border-dashed border-[#C4C6CC] p-12 text-center bg-white">
          <span className="material-symbols-outlined text-5xl text-[#C4C6CC] block mb-3" style={{ fontVariationSettings: '"FILL" 0' }}>pets</span>
          <p className="text-[#44474C] font-medium mb-1">Ainda não tem animais registados</p>
          <p className="text-sm text-[#74777D] mb-5">Registe o seu primeiro animal para poder fazer reservas.</p>
          <button onClick={openNew} className="bg-[#775A19] text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-[#5d4201] transition-colors">
            Registar animal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {animais.map((a) => (
            <AnimalCard key={a.id} animal={a} onEdit={() => openEdit(a)} />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal !== null} onClose={closeModal} title={modal === 'new' ? 'Registar Animal' : 'Editar Animal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Nome *</label>
            <input className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]" value={form.nome} onChange={set('nome')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Espécie *"
                value={form.especie}
                onChange={(v) => setForm(f => ({ ...f, especie: v as Especie }))}
                options={[
                  { value: 'CAO',  label: 'Cão',  icon: 'pets' },
                  { value: 'GATO', label: 'Gato', icon: 'cruelty_free' },
                ]}
              />
            </div>
            {form.especie === 'CAO' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Porte *</label>
                <select className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19] bg-white" value={form.porte} onChange={set('porte')}>
                  <option value="PEQUENO_MEDIO">Pequeno/Médio</option>
                  <option value="GRANDE">Grande</option>
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Raça</label>
            <input className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]" value={form.raca} onChange={set('raca')} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Data de Nascimento</label>
            <input type="date" className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]" value={form.dataNascimento} onChange={set('dataNascimento')} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Observações</label>
            <textarea rows={3} className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19] resize-none" value={form.observacoes} onChange={set('observacoes')} placeholder="Alergias, medicação, comportamento..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 border border-[#C4C6CC] py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5] transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#775A19] text-white py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#5d4201] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {modal === 'new' ? 'Registar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function AnimalCard({ animal, onEdit }: { animal: Animal; onEdit: () => void }) {
  return (
    <div className="bg-white border border-[#C4C6CC] p-5 hover:border-[#775A19] hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={animal.nome} size="lg" />
          <div>
            <p className="font-noto-serif font-semibold text-[#041525]">{animal.nome}</p>
            <p className="text-xs text-[#74777D]">{animal.raca || 'Raça não especificada'}</p>
          </div>
        </div>
        <button onClick={onEdit} className="p-1.5 text-[#74777D] hover:text-[#041525] hover:bg-[#F3F4F5] opacity-0 group-hover:opacity-100 transition-all">
          <Pencil size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <EspecieBadge especie={animal.especie} />
        <PorteBadge porte={animal.porte} />
      </div>
      {animal.observacoes && (
        <p className="text-xs text-[#74777D] mt-3 border-t border-[#E7E8E9] pt-3 line-clamp-2">{animal.observacoes}</p>
      )}
    </div>
  );
}
