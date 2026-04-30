export type Especie = 'CAO' | 'GATO';
export type Porte = 'PEQUENO_MEDIO' | 'GRANDE' | 'NAO_APLICAVEL';

export interface Animal {
  id: number;
  nome: string;
  especie: Especie;
  porte: Porte;
  raca: string;
  dataNascimento: string;
  observacoes: string;
  proprietarioId: number;
  proprietarioNome?: string;
}

export interface AnimalRequest {
  nome: string;
  especie: Especie;
  porte: Porte;
  raca: string;
  dataNascimento: string;
  observacoes?: string;
}
