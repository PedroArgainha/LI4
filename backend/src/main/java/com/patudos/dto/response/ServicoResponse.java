package com.patudos.dto.response;

import java.math.BigDecimal;

public record ServicoResponse(
        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        Integer capacidadeDiaria,
        boolean disponivel
) {}