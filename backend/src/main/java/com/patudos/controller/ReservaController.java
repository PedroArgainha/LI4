package com.patudos.controller;

import com.patudos.dto.request.CriarReservaRequest;
import com.patudos.dto.response.DisponibilidadeResponse;
import com.patudos.dto.response.ReservaResponse;
import com.patudos.enums.Especie;
import com.patudos.enums.Porte;
import com.patudos.service.interfaces.IGestaoReservas;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final IGestaoReservas gestaoReservas;

    public ReservaController(IGestaoReservas gestaoReservas) {
        this.gestaoReservas = gestaoReservas;
    }

    // Público — qualquer visitante pode verificar disponibilidade
    @GetMapping("/disponibilidade")
    public ResponseEntity<DisponibilidadeResponse> verificarDisponibilidade(
            @RequestParam Especie especie,
            @RequestParam Porte porte,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return ResponseEntity.ok(
                gestaoReservas.verificarDisponibilidade(especie, porte, dataInicio, dataFim));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROPRIETARIO', 'FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<ReservaResponse> criarReserva(
            @RequestBody CriarReservaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gestaoReservas.criarReserva(request));
    }

    @PatchMapping("/{id}/confirmar")
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<ReservaResponse> confirmar(@PathVariable Long id) {
        return ResponseEntity.ok(gestaoReservas.confirmarReserva(id));
    }

    @PatchMapping("/{id}/checkin")
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<ReservaResponse> checkIn(
            @PathVariable Long id,
            @RequestParam Long espacoId) {
        return ResponseEntity.ok(gestaoReservas.checkIn(id, espacoId));
    }

    @PatchMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<ReservaResponse> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(gestaoReservas.checkOut(id));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('PROPRIETARIO', 'FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<ReservaResponse> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(gestaoReservas.cancelarReserva(id));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservaResponse> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(gestaoReservas.obterPorId(id));
    }

    @GetMapping("/proprietario/{proprietarioId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReservaResponse>> listarPorProprietario(
            @PathVariable Long proprietarioId) {
        return ResponseEntity.ok(gestaoReservas.listarPorProprietario(proprietarioId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'FUNC_OPERACIONAL', 'DIRECAO', 'ADMIN')")
    public ResponseEntity<List<ReservaResponse>> listarTodas() {
        return ResponseEntity.ok(gestaoReservas.listarTodas());
    }

    // Mapa diário para funcionário operacional
    @GetMapping("/ativas")
    @PreAuthorize("hasAnyRole('FUNC_OPERACIONAL', 'FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<List<ReservaResponse>> listarEstadiasAtivas(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        LocalDate dia = data != null ? data : LocalDate.now();
        return ResponseEntity.ok(gestaoReservas.listarEstadiasAtivas(dia));
    }
}
