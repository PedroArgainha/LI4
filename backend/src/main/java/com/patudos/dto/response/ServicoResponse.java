package com.patudos.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ServicoResponse(
        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        Integer capacidadeDiaria,
        boolean disponivel,
        List<LocalDate> datasIndisponiveis
) {}