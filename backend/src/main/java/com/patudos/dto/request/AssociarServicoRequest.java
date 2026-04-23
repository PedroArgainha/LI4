package com.patudos.dto.request;

import java.time.LocalDate;

public record AssociarServicoRequest(Long servicoId, LocalDate dataExecucao) {}