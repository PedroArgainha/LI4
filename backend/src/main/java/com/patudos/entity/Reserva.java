package com.patudos.entity;

import com.patudos.enums.EstadoReserva;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    // Atribuído no check-in, não na reserva
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "espaco_id")
    private EspacoAlojamento espaco;

    @Column(nullable = false)
    private LocalDate dataInicio;

    @Column(nullable = false)
    private LocalDate dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoReserva estado = EstadoReserva.PENDENTE;

    private LocalDateTime instanteCheckIn;
    private LocalDateTime instanteCheckOut;

    // Preço calculado no momento da criação (base: dias × tarifa diária)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoBase;

    // Serviços associados a esta reserva
    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReservaServico> servicos = new ArrayList<>();

    // Construtores
    public Reserva() {}

    public Reserva(Animal animal, LocalDate dataInicio,
                   LocalDate dataFim, BigDecimal precoBase) {
        this.animal = animal;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.precoBase = precoBase;
    }

    // Calcula o total incluindo serviços
    public BigDecimal calcularTotal() {
        BigDecimal totalServicos = servicos.stream()
                .map(rs -> rs.getServico().getPreco())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return precoBase.add(totalServicos);
    }

    // Getters e setters
    public Long getId() { return id; }

    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }

    public EspacoAlojamento getEspaco() { return espaco; }
    public void setEspaco(EspacoAlojamento espaco) { this.espaco = espaco; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }

    public EstadoReserva getEstado() { return estado; }
    public void setEstado(EstadoReserva estado) { this.estado = estado; }

    public LocalDateTime getInstanteCheckIn() { return instanteCheckIn; }
    public void setInstanteCheckIn(LocalDateTime instanteCheckIn) { this.instanteCheckIn = instanteCheckIn; }

    public LocalDateTime getInstanteCheckOut() { return instanteCheckOut; }
    public void setInstanteCheckOut(LocalDateTime instanteCheckOut) { this.instanteCheckOut = instanteCheckOut; }

    public BigDecimal getPrecoBase() { return precoBase; }
    public void setPrecoBase(BigDecimal precoBase) { this.precoBase = precoBase; }

    public List<ReservaServico> getServicos() { return servicos; }
    public void setServicos(List<ReservaServico> servicos) { this.servicos = servicos; }
}