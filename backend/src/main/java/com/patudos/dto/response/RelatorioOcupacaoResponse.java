package com.patudos.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public record RelatorioOcupacaoResponse(
        LocalDate inicio,
        LocalDate fim,
        int totalEspacos,
        double taxaMediaOcupacao,           // percentagem 0-100
        Map<LocalDate, Integer> ocupacaoPorDia
) {}