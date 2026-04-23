package com.patudos.dto.request;

public record RegistarUtilizadorRequest(
        String email,
        String nome,
        String telefone,
        String password
) {}