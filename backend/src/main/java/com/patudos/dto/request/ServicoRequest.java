package com.patudos.dto.request;

import java.math.BigDecimal;

public record ServicoRequest(
        String nome,
        String descricao,
        BigDecimal preco,
        Integer capacidadeDiaria
) {}