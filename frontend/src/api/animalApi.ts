import http from './http';
import type { Animal, AnimalRequest } from '../types/animal';

export const animalApi = {
  criar: (proprietarioId: number, data: AnimalRequest) =>
    http.post<Animal>(`/animais/proprietario/${proprietarioId}`, data).then((r) => r.data),

  atualizar: (id: number, data: Partial<AnimalRequest>) =>
    http.put<Animal>(`/animais/${id}`, data).then((r) => r.data),

  obter: (id: number) =>
    http.get<Animal>(`/animais/${id}`).then((r) => r.data),

  listarPorProprietario: (proprietarioId: number) =>
    http.get<Animal[]>(`/animais/proprietario/${proprietarioId}`).then((r) => r.data),

  listarTodos: () =>
    http.get<Animal[]>('/animais').then((r) => r.data),

  eliminar: (id: number) =>
    http.delete(`/animais/${id}`).then((r) => r.data),
};
