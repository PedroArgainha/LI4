package com.patudos.controller;

import com.patudos.dto.request.AssociarServicoRequest;
import com.patudos.dto.request.ServicoRequest;
import com.patudos.dto.response.ServicoResponse;
import com.patudos.service.interfaces.IGestaoServicos;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/servicos")
public class ServicoController {

    private final IGestaoServicos gestaoServicos;

    public ServicoController(IGestaoServicos gestaoServicos) {
        this.gestaoServicos = gestaoServicos;
    }

    // Público
    @GetMapping("/disponiveis")
    public ResponseEntity<List<ServicoResponse>> listarDisponiveis() {
        return ResponseEntity.ok(gestaoServicos.listarDisponiveis());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ServicoResponse> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(gestaoServicos.obterPorId(id));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ServicoResponse>> listarTodos() {
        return ResponseEntity.ok(gestaoServicos.listarTodos());
    }

    // Só direção e admin gerem o catálogo
    @PostMapping
    @PreAuthorize("hasAnyRole('DIRECAO', 'ADMIN')")
    public ResponseEntity<ServicoResponse> criar(@RequestBody ServicoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gestaoServicos.criarServico(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRECAO', 'ADMIN')")
    public ResponseEntity<ServicoResponse> editar(
            @PathVariable Long id, @RequestBody ServicoRequest request) {
        return ResponseEntity.ok(gestaoServicos.editarServico(id, request));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('DIRECAO', 'ADMIN')")
    public ResponseEntity<Void> toggleDisponibilidade(@PathVariable Long id) {
        gestaoServicos.toggleDisponibilidade(id);
        return ResponseEntity.noContent().build();
    }

    // Associar/remover serviços de reservas
    @PostMapping("/reserva/{reservaId}")
    @PreAuthorize("hasAnyRole('PROPRIETARIO', 'FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<Void> associarAReserva(
            @PathVariable Long reservaId,
            @RequestBody AssociarServicoRequest request) {
        gestaoServicos.associarAReserva(reservaId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/reserva/{reservaId}/{reservaServicoId}")
    @PreAuthorize("hasAnyRole('PROPRIETARIO', 'FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<Void> removerDeReserva(
            @PathVariable Long reservaId,
            @PathVariable Long reservaServicoId) {
        gestaoServicos.removerDeReserva(reservaId, reservaServicoId);
        return ResponseEntity.noContent().build();
    }

    // Mapa de serviços do dia para funcionário operacional
    @GetMapping("/dia")
    @PreAuthorize("hasAnyRole('FUNC_OPERACIONAL', 'FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<List<ServicoResponse>> servicosDoDia(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(gestaoServicos.listarServicosDoDia(
                data != null ? data : LocalDate.now()));
    }
}