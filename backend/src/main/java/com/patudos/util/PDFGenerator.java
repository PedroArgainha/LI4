package com.patudos.util;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.patudos.entity.Pagamento;
import com.patudos.entity.Reserva;
import com.patudos.entity.ReservaServico;
import com.patudos.dto.response.RelatorioOcupacaoResponse;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Component
public class PDFGenerator {

    private static final DateTimeFormatter DATA_HORA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final Font FONT_TITULO =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
    private static final Font FONT_SUBTITULO =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.DARK_GRAY);
    private static final Font FONT_NORMAL =
            FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
    private static final Font FONT_BOLD =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);

    public byte[] gerarFatura(Pagamento pagamento) {
        Reserva reserva = pagamento.getReserva();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            // Cabeçalho
            Paragraph titulo = new Paragraph("Patudos & Companhia", FONT_TITULO);
            titulo.setAlignment(Element.ALIGN_CENTER);
            doc.add(titulo);

            Paragraph subtitulo = new Paragraph(
                    "Hotel para Animais — Fatura Simulada", FONT_NORMAL);
            subtitulo.setAlignment(Element.ALIGN_CENTER);
            subtitulo.setSpacingAfter(20);
            doc.add(subtitulo);

            // Linha separadora
            doc.add(new Paragraph(" "));

            // Identificação da fatura
            doc.add(new Paragraph("Fatura n.º " + pagamento.getId(), FONT_SUBTITULO));
            doc.add(new Paragraph(
                    "Data de emissão: " + pagamento.getInstantePagamento().format(DATA_HORA),
                    FONT_NORMAL));
            doc.add(new Paragraph(" "));

            // Dados do cliente
            doc.add(new Paragraph("Dados do cliente", FONT_SUBTITULO));
            doc.add(new Paragraph(
                    "Nome: " + reserva.getAnimal().getProprietario().getNome(),
                    FONT_NORMAL));
            doc.add(new Paragraph(
                    "Email: " + reserva.getAnimal().getProprietario().getEmail(),
                    FONT_NORMAL));
            doc.add(new Paragraph(" "));

            // Dados da reserva
            doc.add(new Paragraph("Dados da estadia", FONT_SUBTITULO));
            doc.add(new Paragraph(
                    "Animal: " + reserva.getAnimal().getNome(), FONT_NORMAL));
            doc.add(new Paragraph(
                    "Período: " + reserva.getDataInicio().format(DATA) +
                            " a " + reserva.getDataFim().format(DATA),
                    FONT_NORMAL));
            doc.add(new Paragraph(" "));

            // Tabela de itens
            PdfPTable tabela = new PdfPTable(2);
            tabela.setWidthPercentage(100);
            tabela.setWidths(new float[]{3, 1});

            adicionarCelulaCabecalho(tabela, "Descrição");
            adicionarCelulaCabecalho(tabela, "Valor");

            adicionarCelula(tabela, "Estadia (preço base)", FONT_NORMAL);
            adicionarCelula(tabela,
                    String.format("%.2f €", reserva.getPrecoBase()), FONT_NORMAL);

            for (ReservaServico rs : reserva.getServicos()) {
                adicionarCelula(tabela,
                        "Serviço: " + rs.getServico().getNome() +
                                " (" + rs.getDataExecucao().format(DATA) + ")",
                        FONT_NORMAL);
                adicionarCelula(tabela,
                        String.format("%.2f €", rs.getServico().getPreco()), FONT_NORMAL);
            }

            adicionarCelula(tabela, "Total da reserva", FONT_BOLD);
            adicionarCelula(tabela,
                    String.format("%.2f €", reserva.calcularTotal()), FONT_BOLD);

            doc.add(tabela);
            doc.add(new Paragraph(" "));

            // Detalhes do pagamento
            doc.add(new Paragraph("Detalhes do pagamento", FONT_SUBTITULO));
            doc.add(new Paragraph(
                    "Valor pago: " + String.format("%.2f €", pagamento.getValor()),
                    FONT_NORMAL));
            doc.add(new Paragraph(
                    "Método: " + pagamento.getMetodoPagamento(), FONT_NORMAL));
            doc.add(new Paragraph(" "));

            // Rodapé
            Paragraph rodape = new Paragraph(
                    "Documento gerado automaticamente — fatura simulada sem valor fiscal.",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY));
            rodape.setAlignment(Element.ALIGN_CENTER);
            doc.add(rodape);

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF da fatura", e);
        }
    }

    public byte[] gerarRelatorioOcupacao(RelatorioOcupacaoResponse r) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Paragraph titulo = new Paragraph(
                    "Relatório de Ocupação", FONT_TITULO);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            doc.add(titulo);

            doc.add(new Paragraph(
                    "Período: " + r.inicio().format(DATA) +
                            " a " + r.fim().format(DATA), FONT_NORMAL));
            doc.add(new Paragraph(
                    "Total de espaços: " + r.totalEspacos(), FONT_NORMAL));
            doc.add(new Paragraph(
                    String.format("Taxa média de ocupação: %.1f%%",
                            r.taxaMediaOcupacao()), FONT_BOLD));
            doc.add(new Paragraph(" "));

            // Tabela com ocupação dia a dia
            doc.add(new Paragraph("Ocupação diária", FONT_SUBTITULO));
            PdfPTable tabela = new PdfPTable(2);
            tabela.setWidthPercentage(70);

            adicionarCelulaCabecalho(tabela, "Dia");
            adicionarCelulaCabecalho(tabela, "Espaços ocupados");

            for (Map.Entry<java.time.LocalDate, Integer> e :
                    r.ocupacaoPorDia().entrySet()) {
                adicionarCelula(tabela, e.getKey().format(DATA), FONT_NORMAL);
                adicionarCelula(tabela, String.valueOf(e.getValue()), FONT_NORMAL);
            }

            doc.add(tabela);
            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF de ocupação", e);
        }
    }

    private void adicionarCelulaCabecalho(PdfPTable tabela, String texto) {
        PdfPCell c = new PdfPCell(new Phrase(texto, FONT_BOLD));
        c.setBackgroundColor(new Color(230, 230, 230));
        c.setPadding(8);
        tabela.addCell(c);
    }

    private void adicionarCelula(PdfPTable tabela, String texto, Font font) {
        PdfPCell c = new PdfPCell(new Phrase(texto, font));
        c.setPadding(6);
        tabela.addCell(c);
    }
}