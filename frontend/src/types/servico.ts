export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  capacidadeDiaria: number;
  disponivel: boolean;
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
