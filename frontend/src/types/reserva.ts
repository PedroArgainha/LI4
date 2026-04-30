export type EstadoReserva =
  | 'PENDENTE'
  | 'CONFIRMADA'
  | 'EM_ESTADIA'
  | 'CONCLUIDA'
  | 'CANCELADA';

export interface ReservaServico {
  id: number;
  servicoId: number;
  servicoNome: string;
  servicoPreco: number;
  dataExecucao: string;
}

export interface Reserva {
  id: number;
  animalId: number;
  animalNome?: string;
  proprietarioId?: number;
  proprietarioNome?: string;
  espacoId?: number;
  espacoCodigo?: string;
  dataInicio: string;
  dataFim: string;
  estado: EstadoReserva;
  instanteCheckIn?: string;
  instanteCheckOut?: string;
  precoBase: number;
  servicos: ReservaServico[];
  totalServicos?: number;
  totalReserva?: number;
}

export interface ReservaRequest {
  animalId: number;
  dataInicio: string;
  dataFim: string;
}

export interface DisponibilidadeItem {
  espacoId: number;
  codigo: string;
  especie: string;
  porte: string;
  estado: string;
}
