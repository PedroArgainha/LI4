package com.patudos.dto.response;

import java.time.LocalDate;
import java.util.List;

public record RelatorioServicosResponse(
        LocalDate inicio,
        LocalDate fim,
        List<ItemServicoResponse> servicosMaisRequisitados
) {
    public record ItemServicoResponse(String nomeServico, long totalRequisicoes) {}
}