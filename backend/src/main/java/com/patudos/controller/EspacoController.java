package com.patudos.controller;

import com.patudos.dto.request.EspacoRequest;
import com.patudos.dto.response.EspacoResponse;
import com.patudos.enums.Especie;
import com.patudos.enums.EstadoEspaco;
import com.patudos.enums.Porte;
import com.patudos.service.interfaces.IGestaoEspacos;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/espacos")
public class EspacoController {

    private final IGestaoEspacos gestaoEspacos;

    public EspacoController(IGestaoEspacos gestaoEspacos) {
        this.gestaoEspacos = gestaoEspacos;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'DIRECAO', 'ADMIN')")
    public ResponseEntity<List<EspacoResponse>> listarTodos() {
        return ResponseEntity.ok(gestaoEspacos.listarTodos());
    }

    @GetMapping("/disponiveis")
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'DIRECAO', 'ADMIN')")
    public ResponseEntity<List<EspacoResponse>> listarDisponiveis(
            @RequestParam Especie especie,
            @RequestParam Porte porte,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return ResponseEntity.ok(
                gestaoEspacos.listarDisponiveis(especie, porte, dataInicio, dataFim));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'DIRECAO', 'ADMIN')")
    public ResponseEntity<EspacoResponse> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(gestaoEspacos.obterPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DIRECAO', 'ADMIN')")
    public ResponseEntity<EspacoResponse> criar(@RequestBody EspacoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gestaoEspacos.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRECAO', 'ADMIN')")
    public ResponseEntity<EspacoResponse> editar(
            @PathVariable Long id,
            @RequestBody EspacoRequest request) {
        return ResponseEntity.ok(gestaoEspacos.editar(id, request));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('DIRECAO', 'ADMIN')")
    public ResponseEntity<EspacoResponse> atualizarEstado(
            @PathVariable Long id,
            @RequestParam EstadoEspaco estado) {
        return ResponseEntity.ok(gestaoEspacos.atualizarEstado(id, estado));
    }
}