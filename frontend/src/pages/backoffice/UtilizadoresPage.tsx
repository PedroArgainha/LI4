import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { ROLE_LABELS } from '../../utils/roles';
import type { Utilizador } from '../../types/auth';
import http from '../../api/http';

export default function UtilizadoresPage() {
  const { data: utilizadores = [], isLoading } = useQuery({
    queryKey: ['utilizadores'],
    queryFn: () => http.get<Utilizador[]>('/utilizadores').then((r) => r.data),
  });

  const columns = [
    { key: 'nome', label: 'Utilizador', sortable: true, render: (u: Utilizador) => (
      <div className="flex items-center gap-3">
        <Avatar name={u.nome} size="sm" />
        <div>
          <p className="font-medium text-[#041525] text-sm">{u.nome}</p>
          <p className="text-xs text-[#74777D]">{u.email}</p>
        </div>
      </div>
    )},
    { key: 'tipoConta', label: 'Perfil', sortable: true, render: (u: Utilizador) => (
      <span className="text-xs bg-[#D3E4FA] text-[#041525] px-2.5 py-0.5 font-semibold">
        {ROLE_LABELS[u.tipoConta]}
      </span>
    )},
    { key: 'telefone', label: 'Telefone', render: (u: Utilizador) => <span className="text-[#44474C]">{u.telefone || '—'}</span> },
    { key: 'ativo', label: 'Estado', render: (u: Utilizador) => (
      <span className={`text-xs font-semibold px-2 py-0.5 ${u.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
        {u.ativo ? 'Ativo' : 'Inativo'}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Utilizadores' }]} />
      <div>
        <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Utilizadores</h1>
        <p className="text-sm text-[#44474C] mt-1">{utilizadores.length} contas no sistema</p>
      </div>
      <DataTable data={utilizadores} columns={columns} searchKeys={['nome', 'email', 'tipoConta']} loading={isLoading} emptyMessage="Sem utilizadores" />
    </div>
  );
}
