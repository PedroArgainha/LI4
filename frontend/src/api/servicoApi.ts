import http from './http';
import type { Servico, ServicoRequest, AdicionarServicoReservaRequest, ServicoAgendado } from '../types/servico';

export const servicoApi = {
  listarDisponiveis: (data?: string) =>
      http.get<Servico[]>('/servicos/disponiveis', { params: data ? { data } : {} }).then((r) => r.data),

  listarTodos: () =>
      http.get<Servico[]>('/servicos').then((r) => r.data),

  obter: (id: number) =>
      http.get<Servico>(`/servicos/${id}`).then((r) => r.data),

  criar: (data: ServicoRequest) =>
      http.post<Servico>('/servicos', data).then((r) => r.data),

  atualizar: (id: number, data: Partial<ServicoRequest>) =>
      http.put<Servico>(`/servicos/${id}`, data).then((r) => r.data),

  toggleDisponivel: (id: number) =>
      http.patch<void>(`/servicos/${id}/toggle`).then((r) => r.data),

  bloquearData: (id: number, data: string) =>
      http.post<void>(`/servicos/${id}/indisponibilidades`, null, { params: { data } }).then((r) => r.data),

  desbloquearData: (id: number, data: string) =>
      http.delete<void>(`/servicos/${id}/indisponibilidades`, { params: { data } }).then((r) => r.data),

  remover: (id: number) =>
      http.delete<void>(`/servicos/${id}`).then((r) => r.data),

  adicionarAReserva: (reservaId: number, data: AdicionarServicoReservaRequest) =>
      http.post<void>(`/servicos/reserva/${reservaId}`, data).then((r) => r.data),

  removerDaReserva: (reservaId: number, reservaServicoId: number) =>
      http.delete<void>(`/servicos/reserva/${reservaId}/${reservaServicoId}`).then((r) => r.data),

  doDia: (data: string) =>
      http.get<ServicoAgendado[]>('/servicos/dia', { params: { data } }).then((r) => r.data),

  dodia: (data: string) =>
      http.get<ServicoAgendado[]>('/servicos/dia', { params: { data } }).then((r) => r.data),

  marcarRealizado: (reservaId: number, reservaServicoId: number) =>
      http.patch<ServicoAgendado>(`/servicos/reserva/${reservaId}/${reservaServicoId}/realizado`).then((r) => r.data),
};