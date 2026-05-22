import http from './http';
import type { Utilizador, TipoConta, RegistoRequest, EditarPerfilRequest } from '../types/auth';

export const utilizadorApi = {
    listarTodos: () =>
        http.get<Utilizador[]>('/utilizadores').then((r) => r.data),

    obter: (id: number) =>
        http.get<Utilizador>(`/utilizadores/${id}`).then((r) => r.data),

    criarFuncionario: (data: RegistoRequest, tipo: TipoConta) =>
        http.post<Utilizador>('/utilizadores/funcionario', data, {
            params: { tipo },
        }).then((r) => r.data),

    desativarConta: (id: number) =>
        http.delete(`/utilizadores/${id}`).then((r) => r.data),

    editarPerfil: (id: number, data: EditarPerfilRequest) =>
        http.put<Utilizador>(`/utilizadores/${id}`, data).then((r) => r.data),
};