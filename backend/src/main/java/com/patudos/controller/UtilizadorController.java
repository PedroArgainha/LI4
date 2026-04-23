package com.patudos.controller;

import com.patudos.dto.request.LoginRequest;
import com.patudos.dto.request.RegistarUtilizadorRequest;
import com.patudos.dto.request.EditarPerfilRequest;
import com.patudos.dto.response.LoginResponse;
import com.patudos.dto.response.UtilizadorResponse;
import com.patudos.enums.TipoConta;
import com.patudos.service.interfaces.IGestaoUtilizadores;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UtilizadorController {

    private final IGestaoUtilizadores gestaoUtilizadores;

    public UtilizadorController(IGestaoUtilizadores gestaoUtilizadores) {
        this.gestaoUtilizadores = gestaoUtilizadores;
    }

    // ── Área pública ──────────────────────────────────────────────────────────

    @PostMapping("/auth/registar")
    public ResponseEntity<UtilizadorResponse> registar(
            @RequestBody RegistarUtilizadorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gestaoUtilizadores.registarProprietario(request));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(gestaoUtilizadores.autenticar(request));
    }

    // ── Backoffice — só admin ─────────────────────────────────────────────────

    @PostMapping("/utilizadores/funcionario")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilizadorResponse> criarFuncionario(
            @RequestBody RegistarUtilizadorRequest request,
            @RequestParam TipoConta tipo) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gestaoUtilizadores.criarFuncionario(request, tipo));
    }

    @GetMapping("/utilizadores")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UtilizadorResponse>> listarTodos() {
        return ResponseEntity.ok(gestaoUtilizadores.listarTodos());
    }

    @DeleteMapping("/utilizadores/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desativarConta(@PathVariable Long id) {
        gestaoUtilizadores.desativarConta(id);
        return ResponseEntity.noContent().build();
    }

    // ── Área autenticada — qualquer utilizador edita o próprio perfil ─────────

    @GetMapping("/utilizadores/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UtilizadorResponse> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(gestaoUtilizadores.obterPorId(id));
    }

    @PutMapping("/utilizadores/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UtilizadorResponse> editarPerfil(
            @PathVariable Long id,
            @RequestBody EditarPerfilRequest request) {
        return ResponseEntity.ok(gestaoUtilizadores.editarPerfil(id, request));
    }
}