package com.patudos.service.interfaces;

import com.patudos.dto.response.RelatorioOcupacaoResponse;
import com.patudos.dto.response.RelatorioReceitasResponse;
import com.patudos.dto.response.RelatorioServicosResponse;
import java.time.LocalDate;

public interface IGestaoRelatorios {

    // Taxa de ocupação no período (reservas ativas / total espaços)
    RelatorioOcupacaoResponse taxaOcupacao(LocalDate inicio, LocalDate fim);

    // Receitas totais no período, agrupadas por mês
    RelatorioReceitasResponse receitasPorPeriodo(LocalDate inicio, LocalDate fim);

    // Serviços mais requisitados no período
    RelatorioServicosResponse servicosMaisRequisitados(LocalDate inicio, LocalDate fim);

    // Exportação — devolve bytes do ficheiro
    byte[] exportarRelatorioOcupacaoPDF(LocalDate inicio, LocalDate fim);
    byte[] exportarRelatorioReceitasCSV(LocalDate inicio, LocalDate fim);
}