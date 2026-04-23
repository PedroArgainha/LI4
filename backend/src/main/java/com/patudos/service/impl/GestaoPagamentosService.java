package com.patudos.service.impl;

import com.patudos.dto.request.PagamentoRequest;
import com.patudos.dto.response.PagamentoResponse;
import com.patudos.dto.response.ResumoFinanceiroResponse;
import com.patudos.exception.RecursoNaoEncontradoException;
import com.patudos.exception.RegraDeNegocioException;
import com.patudos.entity.Pagamento;
import com.patudos.entity.Reserva;
import com.patudos.repository.PagamentoRepository;
import com.patudos.repository.ReservaRepository;
import com.patudos.service.interfaces.IGestaoPagamentos;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class GestaoPagamentosService implements IGestaoPagamentos {

    private final PagamentoRepository pagamentoRepository;
    private final ReservaRepository reservaRepository;

    public GestaoPagamentosService(PagamentoRepository pagamentoRepository,
                                   ReservaRepository reservaRepository) {
        this.pagamentoRepository = pagamentoRepository;
        this.reservaRepository = reservaRepository;
    }

    @Override
    @Transactional
    public PagamentoResponse registarPagamento(Long reservaId, PagamentoRequest request) {
        Reserva reserva = encontrarReserva(reservaId);

        // Calcular quanto já foi pago e o saldo pendente
        BigDecimal totalPago = pagamentoRepository.findByReservaId(reservaId).stream()
                .map(Pagamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoPendente = reserva.calcularTotal().subtract(totalPago);

        if (request.valor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraDeNegocioException("O valor do pagamento deve ser positivo.");
        }

        if (request.valor().compareTo(saldoPendente) > 0) {
            throw new RegraDeNegocioException(
                    "O valor introduzido (" + request.valor() +
                            "€) excede o saldo pendente (" + saldoPendente + "€).");
        }

        Pagamento p = new Pagamento(reserva, request.valor(), request.metodoPagamento());
        return toResponse(pagamentoRepository.save(p));
    }

    @Override
    public PagamentoResponse obterPorId(Long pagamentoId) {
        return toResponse(encontrarPagamento(pagamentoId));
    }

    @Override
    public List<PagamentoResponse> listarPorReserva(Long reservaId) {
        return pagamentoRepository.findByReservaId(reservaId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<PagamentoResponse> listarPorPeriodo(LocalDate inicio, LocalDate fim) {
        return pagamentoRepository.findByPeriodo(
                inicio.atStartOfDay(),
                fim.atTime(LocalTime.MAX)
        ).stream().map(this::toResponse).toList();
    }

    @Override
    public ResumoFinanceiroResponse obterResumoReserva(Long reservaId) {
        Reserva reserva = encontrarReserva(reservaId);

        BigDecimal totalReserva = reserva.calcularTotal();

        BigDecimal totalPago = pagamentoRepository.findByReservaId(reservaId).stream()
                .map(Pagamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoPendente = totalReserva.subtract(totalPago);

        return new ResumoFinanceiroResponse(reservaId, totalReserva, totalPago, saldoPendente);
    }

    @Override
    public byte[] gerarFatura(Long pagamentoId) {
        // Placeholder — numa implementação real usaria iText ou JasperReports
        // para gerar um PDF com os dados da reserva e do pagamento
        Pagamento p = encontrarPagamento(pagamentoId);
        String conteudo = String.format(
                "FATURA\nReserva: %d\nValor: %.2f€\nData: %s\nMétodo: %s",
                p.getReserva().getId(),
                p.getValor(),
                p.getInstantePagamento(),
                p.getMetodoPagamento()
        );
        return conteudo.getBytes();
    }

    private Reserva encontrarReserva(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Reserva não encontrada com id: " + id));
    }

    private Pagamento encontrarPagamento(Long id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Pagamento não encontrado com id: " + id));
    }

    private PagamentoResponse toResponse(Pagamento p) {
        return new PagamentoResponse(
                p.getId(),
                p.getReserva().getId(),
                p.getValor(),
                p.getMetodoPagamento(),
                p.getInstantePagamento(),
                p.getCaminhoFatura()
        );
    }
}