import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { espacoApi } from '../../api/espacoApi';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { EspecieBadge, PorteBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';
import { isAdminOrDirecao } from '../../utils/roles';
import type { Especie, Porte } from '../../types/animal';
import type { EspacoAlojamento, EspacoRequest, EstadoEspaco } from '../../../../../../../../Transferências/patudos-ponto4-espacos-corrigido/frontend/src/types/espaco.ts';

const ESTADO_LABELS: Record<EstadoEspaco, string> = {
  DISPONIVEL: 'Disponível',
  OCUPADO: 'Ocupado',
  MANUTENCAO: 'Manutenção',
  INATIVO: 'Inativo',
};

const ESTADO_CLASSES: Record<EstadoEspaco, string> = {
  DISPONIVEL: 'bg-green-100 text-green-800',
  OCUPADO: 'bg-blue-100 text-blue-800',
  MANUTENCAO: 'bg-yellow-100 text-yellow-800',
  INATIVO: 'bg-red-100 text-red-700',
};

const EMPTY_FORM: EspacoRequest = {
  codigo: '',
  especie: 'CAO',
  porte: 'PEQUENO_MEDIO',
  estado: 'DISPONIVEL',
  observacoes: '',
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { mensagem?: string; message?: string } | undefined;
    return data?.mensagem ?? data?.message ?? fallback;
  }
  return fallback;
}

function EstadoEspacoBadge({ estado }: { estado: EstadoEspaco }) {
  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold ${ESTADO_CLASSES[estado]}`}>
      {ESTADO_LABELS[estado]}
    </span>
  );
}

export default function EspacosPage() {
  const qc = useQueryClient();
  const { utilizador } = useAuthStore();
  const podeGerir = isAdminOrDirecao(utilizador?.tipoConta);

  const [modal, setModal] = useState<'new' | 'edit' | null>(null);
  const [editing, setEditing] = useState<EspacoAlojamento | null>(null);
  const [form, setForm] = useState<EspacoRequest>(EMPTY_FORM);
  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | EstadoEspaco>('TODOS');
  const [especieFiltro, setEspecieFiltro] = useState<'TODAS' | Especie>('TODAS');

  const { data: espacos = [], isLoading } = useQuery({
    queryKey: ['espacos'],
    queryFn: espacoApi.listarTodos,
  });

  const espacosFiltrados = useMemo(() => {
    return espacos.filter((espaco) => {
      const okEstado = estadoFiltro === 'TODOS' || espaco.estado === estadoFiltro;
      const okEspecie = especieFiltro === 'TODAS' || espaco.especie === especieFiltro;
      return okEstado && okEspecie;
    });
  }, [espacos, estadoFiltro, especieFiltro]);

  const resumo = useMemo(() => {
    return espacos.reduce(
      (acc, espaco) => {
        acc.total += 1;
        acc[espaco.estado] += 1;
        return acc;
      },
      { total: 0, DISPONIVEL: 0, OCUPADO: 0, MANUTENCAO: 0, INATIVO: 0 } as Record<EstadoEspaco | 'total', number>
    );
  }, [espacos]);

  const criarMutation = useMutation({
    mutationFn: espacoApi.criar,
    onSuccess: () => {
      toast.success('Espaço criado com sucesso.');
      qc.invalidateQueries({ queryKey: ['espacos'] });
      setModal(null);
      setForm(EMPTY_FORM);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, 'Erro ao criar espaço.')),
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EspacoRequest }) => espacoApi.atualizar(id, data),
    onSuccess: () => {
      toast.success('Espaço atualizado com sucesso.');
      qc.invalidateQueries({ queryKey: ['espacos'] });
      setModal(null);
      setEditing(null);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, 'Erro ao atualizar espaço.')),
  });

  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoEspaco }) => espacoApi.atualizarEstado(id, estado),
    onSuccess: () => {
      toast.success('Estado atualizado.');
      qc.invalidateQueries({ queryKey: ['espacos'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, 'Erro ao atualizar estado.')),
  });

  const handleOpenNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal('new');
  };

  const handleOpenEdit = (espaco: EspacoAlojamento) => {
    setEditing(espaco);
    setForm({
      codigo: espaco.codigo,
      especie: espaco.especie,
      porte: espaco.porte,
      estado: espaco.estado,
      observacoes: espaco.observacoes ?? '',
    });
    setModal('edit');
  };

  const updateForm = <K extends keyof EspacoRequest>(key: K, value: EspacoRequest[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === 'especie') {
        next.porte = value === 'GATO' ? 'NAO_APLICAVEL' : 'PEQUENO_MEDIO';
      }

      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const data: EspacoRequest = {
      codigo: form.codigo.trim(),
      especie: form.especie,
      porte: form.porte,
      estado: form.estado ?? 'DISPONIVEL',
      observacoes: form.observacoes?.trim() || null,
    };

    if (modal === 'new') {
      criarMutation.mutate(data);
    } else if (editing) {
      editarMutation.mutate({ id: editing.id, data });
    }
  };

  const columns: Column<EspacoAlojamento>[] = [
    {
      key: 'codigo',
      label: 'Código',
      sortable: true,
      render: (espaco) => <span className="font-bold text-[#041525]">{espaco.codigo}</span>,
    },
    {
      key: 'especie',
      label: 'Espécie',
      sortable: true,
      render: (espaco) => <EspecieBadge especie={espaco.especie} />,
    },
    {
      key: 'porte',
      label: 'Porte',
      sortable: true,
      render: (espaco) => <PorteBadge porte={espaco.porte} />,
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (espaco) => <EstadoEspacoBadge estado={espaco.estado} />,
    },
    {
      key: 'observacoes',
      label: 'Observações',
      render: (espaco) => (
        <span className="text-sm text-[#74777D] line-clamp-1">
          {espaco.observacoes || '—'}
        </span>
      ),
    },
    ...(podeGerir
      ? [
          {
            key: 'acoes',
            label: 'Ações',
            render: (espaco: EspacoAlojamento) => (
              <div className="flex items-center gap-2">
                <select
                  value={espaco.estado}
                  onChange={(event) =>
                    estadoMutation.mutate({ id: espaco.id, estado: event.target.value as EstadoEspaco })
                  }
                  className="border border-[#C4C6CC] px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#775A19]"
                  disabled={estadoMutation.isPending}
                  title="Alterar estado"
                >
                  {Object.entries(ESTADO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(espaco)}
                  className="p-1.5 text-[#74777D] hover:text-[#041525] hover:bg-[#F3F4F5] transition-colors"
                  title="Editar espaço"
                >
                  <Pencil size={14} />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const loadingSubmit = criarMutation.isPending || editarMutation.isPending;

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Espaços de Alojamento' }]} />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Espaços de Alojamento</h1>
          <p className="text-sm text-[#44474C] mt-1">
            Gestão dos espaços concretos usados no check-in das reservas.
          </p>
        </div>

        {podeGerir && (
          <button
            type="button"
            onClick={handleOpenNew}
            className="flex items-center gap-2 bg-[#775A19] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-[#5d4201]"
          >
            <Plus size={14} /> Novo Espaço
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <ResumoCard label="Total" value={resumo.total} />
        <ResumoCard label="Disponíveis" value={resumo.DISPONIVEL} />
        <ResumoCard label="Ocupados" value={resumo.OCUPADO} />
        <ResumoCard label="Manutenção" value={resumo.MANUTENCAO} />
        <ResumoCard label="Inativos" value={resumo.INATIVO} />
      </div>

      <div className="bg-white border border-[#E1E3E4] p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Espécie</label>
          <select
            value={especieFiltro}
            onChange={(event) => setEspecieFiltro(event.target.value as 'TODAS' | Especie)}
            className="border border-[#C4C6CC] px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#775A19]"
          >
            <option value="TODAS">Todas</option>
            <option value="CAO">Cão</option>
            <option value="GATO">Gato</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Estado</label>
          <select
            value={estadoFiltro}
            onChange={(event) => setEstadoFiltro(event.target.value as 'TODOS' | EstadoEspaco)}
            className="border border-[#C4C6CC] px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#775A19]"
          >
            <option value="TODOS">Todos</option>
            {Object.entries(ESTADO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={espacosFiltrados}
        columns={columns}
        searchKeys={['codigo', 'estado', 'especie', 'porte']}
        loading={isLoading}
        emptyMessage="Sem espaços de alojamento"
      />

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'new' ? 'Novo Espaço de Alojamento' : 'Editar Espaço de Alojamento'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">
              Código <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={form.codigo}
              onChange={(event) => updateForm('codigo', event.target.value)}
              placeholder="Ex: CP4"
              required
              className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">
                Espécie <span className="text-red-600">*</span>
              </label>
              <select
                value={form.especie}
                onChange={(event) => updateForm('especie', event.target.value as Especie)}
                className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#775A19]"
              >
                <option value="CAO">Cão</option>
                <option value="GATO">Gato</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">
                Porte <span className="text-red-600">*</span>
              </label>
              <select
                value={form.porte}
                onChange={(event) => updateForm('porte', event.target.value as Porte)}
                disabled={form.especie === 'GATO'}
                className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#775A19] disabled:bg-[#F3F4F5] disabled:text-[#74777D]"
              >
                <option value="PEQUENO_MEDIO">Pequeno/Médio</option>
                <option value="GRANDE">Grande</option>
                <option value="NAO_APLICAVEL">Não aplicável</option>
              </select>
              {form.especie === 'GATO' && (
                <p className="text-xs text-[#74777D] mt-1">Para gatos, o porte fica automaticamente como não aplicável.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Estado</label>
            <select
              value={form.estado ?? 'DISPONIVEL'}
              onChange={(event) => updateForm('estado', event.target.value as EstadoEspaco)}
              className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#775A19]"
            >
              {Object.entries(ESTADO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474C] mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={form.observacoes ?? ''}
              onChange={(event) => updateForm('observacoes', event.target.value)}
              placeholder="Ex: espaço reservado para animais mais calmos"
              className="w-full border border-[#C4C6CC] px-3 py-2.5 text-sm focus:outline-none focus:border-[#775A19] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="flex-1 border border-[#C4C6CC] py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingSubmit}
              className="flex-1 bg-[#775A19] text-white py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#5d4201] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingSubmit && <Loader2 size={14} className="animate-spin" />}
              {modal === 'new' ? 'Criar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ResumoCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-[#E1E3E4] p-4">
      <p className="text-xs uppercase tracking-wider text-[#74777D] font-bold">{label}</p>
      <p className="text-2xl font-bold text-[#041525] mt-1">{value}</p>
    </div>
  );
}
