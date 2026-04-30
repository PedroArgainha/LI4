import http from './http';
import type { Pagamento, PagamentoRequest, ResumoFinanceiro } from '../types/pagamento';

export const pagamentoApi = {
  registar: (reservaId: number, data: PagamentoRequest) =>
    http.post<Pagamento>(`/pagamentos/reserva/${reservaId}`, data).then((r) => r.data),

  obter: (id: number) =>
    http.get<Pagamento>(`/pagamentos/${id}`).then((r) => r.data),

  listarPorReserva: (reservaId: number) =>
    http.get<Pagamento[]>(`/pagamentos/reserva/${reservaId}`).then((r) => r.data),

  resumo: (reservaId: number) =>
    http.get<ResumoFinanceiro>(`/pagamentos/reserva/${reservaId}/resumo`).then((r) => r.data),

  porPeriodo: (inicio: string, fim: string) =>
    http.get<Pagamento[]>('/pagamentos/periodo', { params: { inicio, fim } }).then((r) => r.data),

  fatura: (id: number) =>
    http.get(`/pagamentos/${id}/fatura`, { responseType: 'blob' }).then((r) => r.data),
};
