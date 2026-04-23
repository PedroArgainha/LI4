package com.patudos.service.interfaces;

import com.patudos.dto.request.PagamentoRequest;
import com.patudos.dto.response.PagamentoResponse;
import com.patudos.dto.response.ResumoFinanceiroResponse;
import java.time.LocalDate;
import java.util.List;

public interface IGestaoPagamentos {

    // Registar pagamento para uma reserva
    // Lança exceção se o valor exceder o saldo pendente
    PagamentoResponse registarPagamento(Long reservaId, PagamentoRequest request);

    // Consultas
    PagamentoResponse obterPorId(Long pagamentoId);
    List<PagamentoResponse> listarPorReserva(Long reservaId);
    List<PagamentoResponse> listarPorPeriodo(LocalDate inicio, LocalDate fim);

    // Calcula o total da reserva e o valor já pago — para mostrar saldo pendente
    ResumoFinanceiroResponse obterResumoReserva(Long reservaId);

    // Gera PDF da fatura e guarda o caminho no pagamento
    byte[] gerarFatura(Long pagamentoId);
}