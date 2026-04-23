package com.patudos.controller;

import com.patudos.dto.response.RelatorioOcupacaoResponse;
import com.patudos.dto.response.RelatorioReceitasResponse;
import com.patudos.dto.response.RelatorioServicosResponse;
import com.patudos.service.interfaces.IGestaoRelatorios;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/relatorios")
@PreAuthorize("hasAnyRole('DIRECAO', 'ADMIN')")
public class RelatorioController {

    private final IGestaoRelatorios gestaoRelatorios;

    public RelatorioController(IGestaoRelatorios gestaoRelatorios) {
        this.gestaoRelatorios = gestaoRelatorios;
    }

    @GetMapping("/ocupacao")
    public ResponseEntity<RelatorioOcupacaoResponse> ocupacao(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(gestaoRelatorios.taxaOcupacao(inicio, fim));
    }

    @GetMapping("/receitas")
    public ResponseEntity<RelatorioReceitasResponse> receitas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(gestaoRelatorios.receitasPorPeriodo(inicio, fim));
    }

    @GetMapping("/servicos")
    public ResponseEntity<RelatorioServicosResponse> servicos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(gestaoRelatorios.servicosMaisRequisitados(inicio, fim));
    }

    @GetMapping("/ocupacao/pdf")
    public ResponseEntity<byte[]> exportarOcupacaoPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        byte[] pdf = gestaoRelatorios.exportarRelatorioOcupacaoPDF(inicio, fim);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=ocupacao.pdf")
                .body(pdf);
    }

    @GetMapping("/receitas/csv")
    public ResponseEntity<byte[]> exportarReceitasCSV(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        byte[] csv = gestaoRelatorios.exportarRelatorioReceitasCSV(inicio, fim);
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=receitas.csv")
                .body(csv);
    }
}