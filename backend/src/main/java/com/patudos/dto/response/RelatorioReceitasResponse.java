package com.patudos.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public record RelatorioReceitasResponse(
        LocalDate inicio,
        LocalDate fim,
        BigDecimal totalReceitas,
        Map<String, BigDecimal> receitasPorMes   // chave: "2025-03", valor: total
) {}