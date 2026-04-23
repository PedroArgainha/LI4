package com.patudos.dto.response;

import java.math.BigDecimal;

public record DisponibilidadeResponse(
        boolean disponivel,
        int espacosLivres,
        BigDecimal precoEstimado
) {}