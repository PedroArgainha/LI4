import http from './http';
import type { Servico, ServicoRequest, AdicionarServicoReservaRequest } from '../types/servico';

export const servicoApi = {
  listarDisponiveis: () =>
    http.get<Servico[]>('/servicos/disponiveis').then((r) => r.data),

  listarTodos: () =>
    http.get<Servico[]>('/servicos').then((r) => r.data),

  obter: (id: number) =>
    http.get<Servico>(`/servicos/${id}`).then((r) => r.data),

  criar: (data: ServicoRequest) =>
    http.post<Servico>('/servicos', data).then((r) => r.data),

  atualizar: (id: number, data: Partial<ServicoRequest>) =>
    http.put<Servico>(`/servicos/${id}`, data).then((r) => r.data),

  toggleDisponivel: (id: number) =>
    http.patch<Servico>(`/servicos/${id}/toggle`).then((r) => r.data),

  adicionarAReserva: (reservaId: number, data: AdicionarServicoReservaRequest) =>
    http.post(`/servicos/reserva/${reservaId}`, data).then((r) => r.data),

  removerDaReserva: (reservaId: number, reservaServicoId: number) =>
    http.delete(`/servicos/reserva/${reservaId}/${reservaServicoId}`).then((r) => r.data),

  dodia: (data: string) =>
    http.get('/servicos/dia', { params: { data } }).then((r) => r.data),
};
