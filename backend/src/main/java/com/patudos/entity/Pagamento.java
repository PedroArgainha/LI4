package com.patudos.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamentos")
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false, length = 50)
    private String metodoPagamento; // "NUMERARIO", "MULTIBANCO", "TRANSFERENCIA"

    @Column(nullable = false)
    private LocalDateTime instantePagamento;

    // Caminho para o PDF da fatura gerada
    private String caminhoFatura;

    // Construtores
    public Pagamento() {}

    public Pagamento(Reserva reserva, BigDecimal valor,
                     String metodoPagamento) {
        this.reserva = reserva;
        this.valor = valor;
        this.metodoPagamento = metodoPagamento;
        this.instantePagamento = LocalDateTime.now();
    }

    // Getters e setters
    public Long getId() { return id; }

    public Reserva getReserva() { return reserva; }
    public void setReserva(Reserva reserva) { this.reserva = reserva; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public String getMetodoPagamento() { return metodoPagamento; }
    public void setMetodoPagamento(String metodoPagamento) { this.metodoPagamento = metodoPagamento; }

    public LocalDateTime getInstantePagamento() { return instantePagamento; }
    public void setInstantePagamento(LocalDateTime instantePagamento) { this.instantePagamento = instantePagamento; }

    public String getCaminhoFatura() { return caminhoFatura; }
    public void setCaminhoFatura(String caminhoFatura) { this.caminhoFatura = caminhoFatura; }
}