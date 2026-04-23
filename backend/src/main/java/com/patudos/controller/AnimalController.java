package com.patudos.controller;

import com.patudos.dto.request.AnimalRequest;
import com.patudos.dto.response.AnimalResponse;
import com.patudos.service.interfaces.IGestaoAnimais;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/animais")
public class AnimalController {

    private final IGestaoAnimais gestaoAnimais;

    public AnimalController(IGestaoAnimais gestaoAnimais) {
        this.gestaoAnimais = gestaoAnimais;
    }

    @PostMapping("/proprietario/{proprietarioId}")
    @PreAuthorize("hasAnyRole('PROPRIETARIO', 'FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<AnimalResponse> criarFicha(
            @PathVariable Long proprietarioId,
            @RequestBody AnimalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gestaoAnimais.criarFicha(proprietarioId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROPRIETARIO', 'FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<AnimalResponse> editarFicha(
            @PathVariable Long id,
            @RequestBody AnimalRequest request) {
        return ResponseEntity.ok(gestaoAnimais.editarFicha(id, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnimalResponse> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(gestaoAnimais.obterPorId(id));
    }

    @GetMapping("/proprietario/{proprietarioId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnimalResponse>> listarPorProprietario(
            @PathVariable Long proprietarioId) {
        return ResponseEntity.ok(gestaoAnimais.listarPorProprietario(proprietarioId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'FUNC_OPERACIONAL', 'DIRECAO', 'ADMIN')")
    public ResponseEntity<List<AnimalResponse>> listarTodos() {
        return ResponseEntity.ok(gestaoAnimais.listarTodos());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FUNC_ADMINISTRATIVO', 'ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        gestaoAnimais.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}