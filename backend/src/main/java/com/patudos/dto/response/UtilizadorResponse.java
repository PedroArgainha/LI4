package com.patudos.dto.response;

import com.patudos.enums.TipoConta;

public record UtilizadorResponse(
        Long id,
        String email,
        String nome,
        String telefone,
        TipoConta tipoConta,
        boolean ativo
) {}