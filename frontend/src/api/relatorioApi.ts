import http from './http';
import type { RelatorioOcupacao, RelatorioReceitas, RelatorioServicos } from '../types/relatorio';

export const relatorioApi = {
  ocupacao: (inicio: string, fim: string) =>
    http.get<RelatorioOcupacao>('/relatorios/ocupacao', { params: { inicio, fim } }).then((r) => r.data),

  receitas: (inicio: string, fim: string) =>
    http.get<RelatorioReceitas>('/relatorios/receitas', { params: { inicio, fim } }).then((r) => r.data),

  servicos: (inicio: string, fim: string) =>
    http.get<RelatorioServicos>('/relatorios/servicos', { params: { inicio, fim } }).then((r) => r.data),

  ocupacaoPdf: (inicio: string, fim: string) =>
    http.get('/relatorios/ocupacao/pdf', { params: { inicio, fim }, responseType: 'blob' }).then((r) => r.data),

  receitasCsv: (inicio: string, fim: string) =>
    http.get('/relatorios/receitas/csv', { params: { inicio, fim }, responseType: 'blob' }).then((r) => r.data),
};
