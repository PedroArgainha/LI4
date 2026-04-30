export type MetodoPagamento = 'MBWAY' | 'CARTAO' | 'TRANSFERENCIA' | 'NUMERARIO';

export interface Pagamento {
  id: number;
  reservaId: number;
  valor: number;
  metodoPagamento: MetodoPagamento;
  instantePagamento: string;
  caminhoFatura?: string;
}

export interface PagamentoRequest {
  valor: number;
  metodoPagamento: MetodoPagamento;
}

export interface ResumoFinanceiro {
  reservaId: number;
  totalReserva: number;
  totalPago: number;
  saldoPendente: number;
  pagamentos: Pagamento[];
}
