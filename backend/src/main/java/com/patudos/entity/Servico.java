package com.patudos.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "servicos")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal preco;

    // null = sem limite de capacidade diária
    private Integer capacidadeDiaria;

    @Column(nullable = false)
    private boolean disponivel = true;

    // Construtores
    public Servico() {}

    public Servico(String nome, String descricao, BigDecimal preco,
                   Integer capacidadeDiaria) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.capacidadeDiaria = capacidadeDiaria;
    }

    // Getters e setters
    public Long getId() { return id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }

    public Integer getCapacidadeDiaria() { return capacidadeDiaria; }
    public void setCapacidadeDiaria(Integer capacidadeDiaria) { this.capacidadeDiaria = capacidadeDiaria; }

    public boolean isDisponivel() { return disponivel; }
    public void setDisponivel(boolean disponivel) { this.disponivel = disponivel; }
}