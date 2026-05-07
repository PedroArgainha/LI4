import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { utilizadorApi } from '../../api/utilizadorApi';
import { useAuthStore } from '../../store/authStore';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Modal } from '../../components/ui/Modal';
import { ROLE_LABELS, isAdmin } from '../../utils/roles';
import type { Utilizador, TipoConta, RegistoRequest } from '../../types/auth';
import { Plus, UserX, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY: RegistoRequest = {
    nome: '',
    email: '',
    telefone: '',
    password: '',
};

// Tipos de conta atribuíveis pelo admin (exclui PROPRIETARIO, criado via registo público)
const TIPOS_FUNCIONARIO: TipoConta[] = [
    'FUNC_ADMINISTRATIVO',
    'FUNC_OPERACIONAL',
    'DIRECAO',
];

export default function UtilizadoresPage() {
    const qc = useQueryClient();
    const { utilizador: atual } = useAuthStore();
    const podeGerir = isAdmin(atual?.tipoConta);

    const [modal, setModal] = useState(false);
    const [form, setForm] = useState<RegistoRequest>(EMPTY);
    const [tipo, setTipo] = useState<TipoConta>('FUNC_ADMINISTRATIVO');

    const { data: utilizadores = [], isLoading } = useQuery({
        queryKey: ['utilizadores'],
        queryFn: utilizadorApi.listarTodos,
    });

    const criarMutation = useMutation({
        mutationFn: () => utilizadorApi.criarFuncionario(form, tipo),
        onSuccess: () => {
            toast.success('Funcionário criado com sucesso!');
            qc.invalidateQueries({ queryKey: ['utilizadores'] });
            setModal(false);
            setForm(EMPTY);
            setTipo('FUNC_ADMINISTRATIVO');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.mensagem ?? 'Erro ao criar funcionário.');
        },
    });

    const desativarMutation = useMutation({
        mutationFn: (id: number) => utilizadorApi.desativarConta(id),
        onSuccess: () => {
            toast.success('Conta desativada.');
            qc.invalidateQueries({ queryKey: ['utilizadores'] });
        },
        onError: () => toast.error('Erro ao desativar conta.'),
    });

    const set = (k: keyof RegistoRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nome || !form.email || !form.password) {
            toast.error('Preencha todos os campos obrigatórios.');
            return;
        }
        criarMutation.mutate();
    };

    const handleDesativar = (u: Utilizador) => {
        if (u.id === atual?.id) {
            toast.error('Não pode desativar a sua própria conta.');
            return;
        }
        if (confirm(`Desativar a conta de ${u.nome}?`)) {
            desativarMutation.mutate(u.id);
        }
    };

    const columns = [
        {
            key: 'nome',
            label: 'Utilizador',
            sortable: true,
            render: (u: Utilizador) => (
                <div className="flex items-center gap-3">
                    <Avatar name={u.nome} size="sm" />
                    <div>
                        <p className="font-medium text-[#041525] text-sm">{u.nome}</p>
                        <p className="text-xs text-[#74777D]">{u.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'tipoConta',
            label: 'Perfil',
            sortable: true,
            render: (u: Utilizador) => (
                <span className="text-xs bg-[#D3E4FA] text-[#041525] px-2.5 py-0.5 font-semibold">
          {ROLE_LABELS[u.tipoConta]}
        </span>
            ),
        },
        {
            key: 'telefone',
            label: 'Telefone',
            render: (u: Utilizador) => (
                <span className="text-[#44474C]">{u.telefone || '—'}</span>
            ),
        },
        {
            key: 'ativo',
            label: 'Estado',
            render: (u: Utilizador) => (
                <span
                    className={`text-xs font-semibold px-2 py-0.5 ${
                        u.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
          {u.ativo ? 'Ativo' : 'Inativo'}
        </span>
            ),
        },
        ...(podeGerir
            ? [
                {
                    key: 'acoes',
                    label: 'Ações',
                    render: (u: Utilizador) =>
                        u.ativo && u.id !== atual?.id ? (
                            <button
                                onClick={() => handleDesativar(u)}
                                title="Desativar conta"
                                className="text-red-600 hover:text-red-800 transition-colors"
                            >
                                <UserX size={16} />
                            </button>
                        ) : (
                            <span className="text-[#C4C6CC] text-xs">—</span>
                        ),
                },
            ]
            : []),
    ];

    return (
        <div className="space-y-6">
            <Breadcrumbs
                crumbs={[
                    { label: 'Backoffice', to: '/backoffice' },
                    { label: 'Utilizadores' },
                ]}
            />

            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">
                        Utilizadores
                    </h1>
                    <p className="text-sm text-[#44474C] mt-1">
                        {utilizadores.length} contas no sistema
                    </p>
                </div>
                {podeGerir && (
                    <button
                        onClick={() => setModal(true)}
                        className="flex items-center gap-2 bg-[#775A19] text-white px-4 py-2 text-sm font-medium hover:bg-[#5d4201] transition-colors"
                    >
                        <Plus size={16} /> Criar funcionário
                    </button>
                )}
            </div>

            <DataTable
                data={utilizadores}
                columns={columns}
                searchKeys={['nome', 'email', 'tipoConta']}
                loading={isLoading}
                emptyMessage="Sem utilizadores"
            />

            {modal && (
                <Modal open title="Criar Funcionário" onClose={() => setModal(false)}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-[#44474C] mb-1">
                                Nome <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.nome}
                                onChange={set('nome')}
                                required
                                className="w-full border border-[#C4C6CC] px-3 py-2 text-sm focus:outline-none focus:border-[#775A19]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[#44474C] mb-1">
                                Email <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={set('email')}
                                required
                                className="w-full border border-[#C4C6CC] px-3 py-2 text-sm focus:outline-none focus:border-[#775A19]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[#44474C] mb-1">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                value={form.telefone}
                                onChange={set('telefone')}
                                className="w-full border border-[#C4C6CC] px-3 py-2 text-sm focus:outline-none focus:border-[#775A19]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[#44474C] mb-1">
                                Password inicial <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={set('password')}
                                required
                                minLength={6}
                                className="w-full border border-[#C4C6CC] px-3 py-2 text-sm focus:outline-none focus:border-[#775A19]"
                            />
                            <p className="text-xs text-[#74777D] mt-1">
                                Mínimo 6 caracteres. O funcionário poderá alterar depois no
                                seu perfil.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm text-[#44474C] mb-1">
                                Cargo <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value as TipoConta)}
                                className="w-full border border-[#C4C6CC] px-3 py-2 text-sm focus:outline-none focus:border-[#775A19]"
                            >
                                {TIPOS_FUNCIONARIO.map((t) => (
                                    <option key={t} value={t}>
                                        {ROLE_LABELS[t]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setModal(false)}
                                className="flex-1 border border-[#C4C6CC] py-2.5 text-sm font-medium text-[#44474C] hover:bg-[#F3F4F5]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={criarMutation.isPending}
                                className="flex-1 bg-[#775A19] text-white py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#5d4201] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {criarMutation.isPending && (
                                    <Loader2 size={14} className="animate-spin" />
                                )}
                                Criar conta
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}