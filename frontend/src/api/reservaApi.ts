import http from './http';
import type { Reserva, ReservaRequest, DisponibilidadeItem } from '../types/reserva';
import type { Especie, Porte } from '../types/animal';

export const reservaApi = {
  disponibilidade: (especie: Especie, porte: Porte, dataInicio: string, dataFim: string) =>
    http.get<DisponibilidadeItem[]>('/reservas/disponibilidade', {
      params: { especie, porte, dataInicio, dataFim },
    }).then((r) => r.data),

  criar: (data: ReservaRequest) =>
    http.post<Reserva>('/reservas', data).then((r) => r.data),

  confirmar: (id: number) =>
    http.patch<Reserva>(`/reservas/${id}/confirmar`).then((r) => r.data),

  checkin: (id: number, espacoId: number) =>
    http.patch<Reserva>(`/reservas/${id}/checkin`, null, { params: { espacoId } }).then((r) => r.data),

  checkout: (id: number) =>
    http.patch<Reserva>(`/reservas/${id}/checkout`).then((r) => r.data),

  cancelar: (id: number) =>
    http.patch<Reserva>(`/reservas/${id}/cancelar`).then((r) => r.data),

  obter: (id: number) =>
    http.get<Reserva>(`/reservas/${id}`).then((r) => r.data),

  listarPorProprietario: (proprietarioId: number) =>
    http.get<Reserva[]>(`/reservas/proprietario/${proprietarioId}`).then((r) => r.data),

  listarTodas: () =>
    http.get<Reserva[]>('/reservas').then((r) => r.data),

  listarAtivas: (data?: string) =>
    http.get<Reserva[]>('/reservas/ativas', { params: data ? { data } : {} }).then((r) => r.data),
};
