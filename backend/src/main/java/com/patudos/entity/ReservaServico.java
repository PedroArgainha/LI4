package com.patudos.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

// Representa a associação de um serviço a uma reserva.
// Tem a sua própria entidade (e não só uma @ManyToMany) porque precisamos
// de guardar a data de execução do serviço.
@Entity
@Table(name = "reservas_servicos")
public class ReservaServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;

    @Column(nullable = false)
    private boolean realizado = false;

    // Data em que o serviço deve ser executado (durante a estadia)
    private LocalDate dataExecucao;

    // Construtores
    public ReservaServico() {}

    public ReservaServico(Reserva reserva, Servico servico, LocalDate dataExecucao) {
        this.reserva = reserva;
        this.servico = servico;
        this.dataExecucao = dataExecucao;
    }

    // Getters e setters
    public Long getId() { return id; }

    public Reserva getReserva() { return reserva; }
    public void setReserva(Reserva reserva) { this.reserva = reserva; }

    public Servico getServico() { return servico; }
    public void setServico(Servico servico) { this.servico = servico; }

    public LocalDate getDataExecucao() { return dataExecucao; }
    public void setDataExecucao(LocalDate dataExecucao) { this.dataExecucao = dataExecucao; }

    public boolean isRealizado() { return realizado; }
    public void setRealizado(boolean realizado) { this.realizado = realizado; }
}