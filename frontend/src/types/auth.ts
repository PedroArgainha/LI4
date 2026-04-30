export type TipoConta =
  | 'PROPRIETARIO'
  | 'FUNC_ADMINISTRATIVO'
  | 'FUNC_OPERACIONAL'
  | 'DIRECAO'
  | 'ADMIN';

export interface Utilizador {
  id: number;
  email: string;
  nome: string;
  telefone: string;
  tipoConta: TipoConta;
  ativo: boolean;
}

export interface LoginResponse {
  token: string;
  utilizador: Utilizador;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistoRequest {
  nome: string;
  email: string;
  telefone: string;
  password: string;
}
