package com.patudos.dto.response;

import com.patudos.enums.EstadoReserva;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservaResponse(
        Long id,
        Long animalId,
        String animalNome,
        String proprietarioNome,
        String codigoEspaco,       // null até ao check-in
        LocalDate dataInicio,
        LocalDate dataFim,
        EstadoReserva estado,
        LocalDateTime instanteCheckIn,
        LocalDateTime instanteCheckOut,
        BigDecimal precoBase,
        BigDecimal totalComServicos
) {}