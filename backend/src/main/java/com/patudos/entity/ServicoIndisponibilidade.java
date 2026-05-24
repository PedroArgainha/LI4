package com.patudos.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
        name = "servicos_indisponibilidades",
        uniqueConstraints = @UniqueConstraint(columnNames = {"servico_id", "data"})
)
public class ServicoIndisponibilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;

    @Column(nullable = false)
    private LocalDate data;

    public ServicoIndisponibilidade() {}

    public ServicoIndisponibilidade(Servico servico, LocalDate data) {
        this.servico = servico;
        this.data = data;
    }

    public Long getId() { return id; }

    public Servico getServico() { return servico; }
    public void setServico(Servico servico) { this.servico = servico; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
}