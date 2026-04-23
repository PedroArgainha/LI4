package com.patudos.service.impl;

import com.patudos.dto.response.RelatorioOcupacaoResponse;
import com.patudos.dto.response.RelatorioReceitasResponse;
import com.patudos.dto.response.RelatorioServicosResponse;
import com.patudos.dto.response.RelatorioServicosResponse.ItemServicoResponse;
import com.patudos.entity.Pagamento;
import com.patudos.repository.EspacoAlojamentoRepository;
import com.patudos.repository.PagamentoRepository;
import com.patudos.repository.ReservaRepository;
import com.patudos.service.interfaces.IGestaoRelatorios;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GestaoRelatoriosService implements IGestaoRelatorios {

    private final ReservaRepository reservaRepository;
    private final PagamentoRepository pagamentoRepository;
    private final EspacoAlojamentoRepository espacoRepository;

    public GestaoRelatoriosService(ReservaRepository reservaRepository,
                                   PagamentoRepository pagamentoRepository,
                                   EspacoAlojamentoRepository espacoRepository) {
        this.reservaRepository = reservaRepository;
        this.pagamentoRepository = pagamentoRepository;
        this.espacoRepository = espacoRepository;
    }

    @Override
    public RelatorioOcupacaoResponse taxaOcupacao(LocalDate inicio, LocalDate fim) {
        int totalEspacos = (int) espacoRepository.count();
        if (totalEspacos == 0) {
            return new RelatorioOcupacaoResponse(inicio, fim, 0, 0.0, Map.of());
        }

        // Para cada dia do período, contar quantos espaços estavam ocupados
        Map<LocalDate, Integer> ocupacaoPorDia = new LinkedHashMap<>();
        LocalDate dia = inicio;

        while (!dia.isAfter(fim)) {
            final LocalDate diaFinal = dia;
            long ocupados = reservaRepository.findEstadiasAtivas(diaFinal).size();
            ocupacaoPorDia.put(diaFinal, (int) ocupados);
            dia = dia.plusDays(1);
        }

        double taxaMedia = ocupacaoPorDia.values().stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0) / totalEspacos * 100;

        return new RelatorioOcupacaoResponse(inicio, fim, totalEspacos, taxaMedia, ocupacaoPorDia);
    }

    @Override
    public RelatorioReceitasResponse receitasPorPeriodo(LocalDate inicio, LocalDate fim) {
        List<Pagamento> pagamentos = pagamentoRepository.findByPeriodo(
                inicio.atStartOfDay(), fim.atTime(LocalTime.MAX));

        BigDecimal total = pagamentos.stream()
                .map(Pagamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Agrupar por mês — chave no formato "2025-03"
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, BigDecimal> porMes = pagamentos.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getInstantePagamento().format(fmt),
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Pagamento::getValor, BigDecimal::add)
                ));

        return new RelatorioReceitasResponse(inicio, fim, total, porMes);
    }

    @Override
    public RelatorioServicosResponse servicosMaisRequisitados(LocalDate inicio, LocalDate fim) {
        // Obter todas as reservas no período e contar as requisições de cada serviço
        List<ItemServicoResponse> ranking = reservaRepository.findAll().stream()
                .filter(r -> !r.getDataInicio().isAfter(fim) && !r.getDataFim().isBefore(inicio))
                .flatMap(r -> r.getServicos().stream())
                .collect(Collectors.groupingBy(
                        rs -> rs.getServico().getNome(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new ItemServicoResponse(e.getKey(), e.getValue()))
                .toList();

        return new RelatorioServicosResponse(inicio, fim, ranking);
    }

    @Override
    public byte[] exportarRelatorioOcupacaoPDF(LocalDate inicio, LocalDate fim) {
        // Placeholder — em produção usaria iText ou JasperReports
        RelatorioOcupacaoResponse r = taxaOcupacao(inicio, fim);
        String conteudo = String.format(
                "RELATÓRIO DE OCUPAÇÃO\nPeríodo: %s a %s\nTotal espaços: %d\nTaxa média: %.1f%%",
                r.inicio(), r.fim(), r.totalEspacos(), r.taxaMediaOcupacao()
        );
        return conteudo.getBytes();
    }

    @Override
    public byte[] exportarRelatorioReceitasCSV(LocalDate inicio, LocalDate fim) {
        RelatorioReceitasResponse r = receitasPorPeriodo(inicio, fim);
        StringBuilder csv = new StringBuilder("Mês,Receita\n");
        r.receitasPorMes().forEach((mes, valor) ->
                csv.append(mes).append(",").append(valor).append("\n")
        );
        return csv.toString().getBytes();
    }
}