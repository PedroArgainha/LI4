package com.patudos.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PagamentoResponse(
        Long id,
        Long reservaId,
        BigDecimal valor,
        String metodoPagamento,
        LocalDateTime instantePagamento,
        String caminhoFatura
) {}