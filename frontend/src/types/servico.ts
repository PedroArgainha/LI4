export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  capacidadeDiaria: number;
  disponivel: boolean;
  datasIndisponiveis?: string[];
}

export interface ServicoRequest {
  nome: string;
  descricao: string;
  preco: number;
  capacidadeDiaria: number;
}

export interface AdicionarServicoReservaRequest {
  servicoId: number;
  dataExecucao: string;
}

export interface ServicoAgendado {
  id: number;
  reservaId: number;
  servicoId: number;
  servicoNome: string;
  animalId: number;
  animalNome: string;
  proprietarioNome: string;
  codigoEspaco?: string | null;
  dataExecucao: string;
  realizado: boolean;
  preco: number;
  estadoReserva: string;
}