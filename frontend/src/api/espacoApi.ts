import http from './http';
import type { Especie, Porte } from '../types/animal';
import type { EspacoAlojamento, EspacoRequest, EstadoEspaco } from '../types/espaco';

export const espacoApi = {
  listarTodos: () =>
    http.get<EspacoAlojamento[]>('/espacos').then((r) => r.data),

  obter: (id: number) =>
    http.get<EspacoAlojamento>(`/espacos/${id}`).then((r) => r.data),

  listarDisponiveis: (params: {
    especie: Especie;
    porte: Porte;
    dataInicio: string;
    dataFim: string;
  }) =>
    http.get<EspacoAlojamento[]>('/espacos/disponiveis', { params }).then((r) => r.data),

  criar: (data: EspacoRequest) =>
    http.post<EspacoAlojamento>('/espacos', data).then((r) => r.data),

  atualizar: (id: number, data: EspacoRequest) =>
    http.put<EspacoAlojamento>(`/espacos/${id}`, data).then((r) => r.data),

  atualizarEstado: (id: number, estado: EstadoEspaco) =>
    http.patch<EspacoAlojamento>(`/espacos/${id}/estado`, null, { params: { estado } }).then((r) => r.data),
};
