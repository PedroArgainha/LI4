package com.patudos.dto.response;

import com.patudos.enums.EstadoReserva;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DisponibilidadeResponse(
        boolean disponivel,
        int espacosLivres,
        BigDecimal precoEstimado
) {
    public static record ServicoAgendadoResponse(
            Long reservaServicoId,
            Long reservaId,
            Long servicoId,
            String servicoNome,
            Long animalId,
            String animalNome,
            String proprietarioNome,
            String codigoEspaco,
            LocalDate dataExecucao,
            boolean realizado,
            BigDecimal preco,
            EstadoReserva estadoReserva
    ) {}
}