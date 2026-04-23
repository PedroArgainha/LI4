package com.patudos.entity;

import com.patudos.enums.Especie;
import com.patudos.enums.Porte;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "animais")
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Especie especie;

    // Para cães: PEQUENO_MEDIO ou GRANDE. Para gatos: NAO_APLICAVEL.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Porte porte;

    @Column(length = 100)
    private String raca;

    private LocalDate dataNascimento;

    // Necessidades especiais, medicação, etc.
    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    private Utilizador proprietario;

    // Construtores
    public Animal() {}

    public Animal(String nome, Especie especie, Porte porte,
                  String raca, LocalDate dataNascimento,
                  String observacoes, Utilizador proprietario) {
        this.nome = nome;
        this.especie = especie;
        this.porte = porte;
        this.raca = raca;
        this.dataNascimento = dataNascimento;
        this.observacoes = observacoes;
        this.proprietario = proprietario;
    }

    // Getters e setters
    public Long getId() { return id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public Especie getEspecie() { return especie; }
    public void setEspecie(Especie especie) { this.especie = especie; }

    public Porte getPorte() { return porte; }
    public void setPorte(Porte porte) { this.porte = porte; }

    public String getRaca() { return raca; }
    public void setRaca(String raca) { this.raca = raca; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public Utilizador getProprietario() { return proprietario; }
    public void setProprietario(Utilizador proprietario) { this.proprietario = proprietario; }
}