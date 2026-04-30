import { useQuery } from '@tanstack/react-query';
import { animalApi } from '../../api/animalApi';
import { DataTable } from '../../components/ui/DataTable';
import { EspecieBadge, PorteBadge } from '../../components/ui/Badge';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import type { Animal } from '../../types/animal';
import { formatDate } from '../../utils/formatters';

export default function AnimaisBackoffice() {
  const { data: animais = [], isLoading } = useQuery({ queryKey: ['animais'], queryFn: animalApi.listarTodos });

  const columns = [
    { key: 'nome',           label: 'Animal',       sortable: true, render: (a: Animal) => <span className="font-medium text-[#041525]">{a.nome}</span> },
    { key: 'especie',        label: 'Espécie',       render: (a: Animal) => <EspecieBadge especie={a.especie} /> },
    { key: 'porte',          label: 'Porte',         render: (a: Animal) => <PorteBadge porte={a.porte} /> },
    { key: 'raca',           label: 'Raça',          sortable: true },
    { key: 'proprietarioNome', label: 'Proprietário', sortable: true, render: (a: Animal) => <span className="text-[#44474C]">{a.proprietarioNome ?? `#${a.proprietarioId}`}</span> },
    { key: 'dataNascimento', label: 'Nascimento',    render: (a: Animal) => a.dataNascimento ? formatDate(a.dataNascimento) : '—' },
    { key: 'observacoes',    label: 'Observações',   render: (a: Animal) => <span className="text-xs text-[#74777D] line-clamp-1">{a.observacoes || '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Animais' }]} />
      <div>
        <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Animais Registados</h1>
        <p className="text-sm text-[#44474C] mt-1">{animais.length} animais no sistema</p>
      </div>
      <DataTable data={animais} columns={columns} searchKeys={['nome', 'raca', 'proprietarioNome']} loading={isLoading} emptyMessage="Sem animais registados" />
    </div>
  );
}
