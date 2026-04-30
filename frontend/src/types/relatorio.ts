export interface RelatorioOcupacao {
  periodo: { inicio: string; fim: string };
  totalReservas: number;
  reservasPorEstado: Record<string, number>;
  taxaOcupacaoMedia: number;
}

export interface RelatorioReceitas {
  periodo: { inicio: string; fim: string };
  totalReceitas: number;
  receitasPorDia: { data: string; total: number }[];
}

export interface RelatorioServicos {
  periodo: { inicio: string; fim: string };
  servicosMaisUsados: { nome: string; total: number; receita: number }[];
}
