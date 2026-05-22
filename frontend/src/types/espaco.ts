import type { Especie, Porte } from './animal';

export type EstadoEspaco = 'DISPONIVEL' | 'OCUPADO' | 'MANUTENCAO' | 'INATIVO';

export interface EspacoAlojamento {
    id: number;
    codigo: string;
    especie: Especie;
    porte: Porte;
    estado: EstadoEspaco;
    observacoes?: string | null;
}

export interface EspacoRequest {
    codigo: string;
    especie: Especie;
    porte: Porte;
    estado?: EstadoEspaco;
    observacoes?: string | null;
}