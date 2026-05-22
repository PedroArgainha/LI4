import type { Especie, Porte } from './animal';

export type EstadoReserva =
    | 'PENDENTE'
    | 'EM_ESTADIA'
    | 'CONCLUIDA'
    | 'CANCELADA';

export interface Reserva {
  id: number;
  animalId: number;
  animalNome?: string;
  animalEspecie?: Especie;
  animalPorte?: Porte;
  proprietarioNome?: string;
  codigoEspaco?: string | null;
  dataInicio: string;
  dataFim: string;
  estado: EstadoReserva;
  instanteCheckIn?: string | null;
  instanteCheckOut?: string | null;
  precoBase: number;
  totalComServicos: number;
}

export interface ReservaRequest {
  animalId: number;
  dataInicio: string;
  dataFim: string;
}

export interface DisponibilidadeResponse {
  disponivel: boolean;
  espacosLivres: number;
  precoEstimado: number;
}