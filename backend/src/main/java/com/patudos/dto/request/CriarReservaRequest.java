package com.patudos.dto.request;

import java.time.LocalDate;

public record CriarReservaRequest(
        Long animalId,
        LocalDate dataInicio,
        LocalDate dataFim
) {}