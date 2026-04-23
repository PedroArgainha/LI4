package com.patudos.dto.request;

import java.math.BigDecimal;

public record PagamentoRequest(BigDecimal valor, String metodoPagamento) {}