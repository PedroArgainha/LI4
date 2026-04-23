package com.patudos.dto.response;

import java.math.BigDecimal;

public record ResumoFinanceiroResponse(
        Long reservaId,
        BigDecimal totalReserva,
        BigDecimal totalPago,
        BigDecimal saldoPendente
) {}