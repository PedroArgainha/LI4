package com.patudos.controller;

import com.patudos.dto.request.PagamentoRequest;
import com.patudos.dto.response.PagamentoResponse;
import com.patudos.dto.response.ResumoFinanceiroResponse;
import com.patudos.service.interfaces.IGestaoPagamentos;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pagamentos")
public class PagamentoController {

    private final IGestaoPagamentos gestaoPagamentos;

    public PagamentoController(IGestaoPagamentos gestaoPagamentos) {
        this.gestaoPagamentos = gestaoPagamentos;
    }

    @PostMapping("/reserva/{reservaId}")
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<PagamentoResponse> registar(
            @PathVariable Long reservaId,
            @RequestBody PagamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gestaoPagamentos.registarPagamento(reservaId, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'DIRECAO', 'ADMIN')")
    public ResponseEntity<PagamentoResponse> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(gestaoPagamentos.obterPorId(id));
    }

    @GetMapping("/reserva/{reservaId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PagamentoResponse>> listarPorReserva(
            @PathVariable Long reservaId) {
        return ResponseEntity.ok(gestaoPagamentos.listarPorReserva(reservaId));
    }

    @GetMapping("/reserva/{reservaId}/resumo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResumoFinanceiroResponse> resumoReserva(
            @PathVariable Long reservaId) {
        return ResponseEntity.ok(gestaoPagamentos.obterResumoReserva(reservaId));
    }

    @GetMapping("/periodo")
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'DIRECAO', 'ADMIN')")
    public ResponseEntity<List<PagamentoResponse>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(gestaoPagamentos.listarPorPeriodo(inicio, fim));
    }

    @GetMapping("/{id}/fatura")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> gerarFatura(@PathVariable Long id) {
        byte[] pdf = gestaoPagamentos.gerarFatura(id);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=fatura-" + id + ".pdf")
                .body(pdf);
    }
}