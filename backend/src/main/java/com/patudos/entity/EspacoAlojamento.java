package com.patudos.entity;

import com.patudos.enums.Especie;
import com.patudos.enums.EstadoEspaco;
import com.patudos.enums.Porte;
import jakarta.persistence.*;

@Entity
@Table(name = "espacos_alojamento")
public class EspacoAlojamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Código visível para funcionários, ex: "CA1", "CF3", "CG2"
    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    // Que espécie pode ficar aqui
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Especie especie;

    // Para cões: PEQUENO_MEDIO ou GRANDE. Para gatos: NAO_APLICAVEL.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Porte porte;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoEspaco estado = EstadoEspaco.DISPONIVEL;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    // Construtores
    public EspacoAlojamento() {}

    public EspacoAlojamento(String codigo, Especie especie, Porte porte) {
        this.codigo = codigo;
        this.especie = especie;
        this.porte = porte;
    }

    // Getters e setters
    public Long getId() { return id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Especie getEspecie() { return especie; }
    public void setEspecie(Especie especie) { this.especie = especie; }

    public Porte getPorte() { return porte; }
    public void setPorte(Porte porte) { this.porte = porte; }

    public EstadoEspaco getEstado() { return estado; }
    public void setEstado(EstadoEspaco estado) { this.estado = estado; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    // Lógica de negócio simples dentro da entidade
    public boolean isCompativel(Especie especieAnimal, Porte porteAnimal) {
        if (this.especie != especieAnimal) return false;
        if (especieAnimal == Especie.CAO && this.porte != porteAnimal) return false;
        return this.estado == EstadoEspaco.DISPONIVEL;
    }
}