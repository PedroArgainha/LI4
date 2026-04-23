package com.patudos.entity;

import com.patudos.enums.TipoConta;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "utilizadores")
public class Utilizador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(nullable = false)
    private String telefone;

    // BCrypt hash — nunca a password em texto claro
    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoConta tipoConta;

    // false = conta "eliminada" mas mantemos o registo para integridade referencial
    @Column(nullable = false)
    private boolean ativo = true;

    // Apenas preenchido se tipoConta == PROPRIETARIO
    @OneToMany(mappedBy = "proprietario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Animal> animais;

    // Construtores
    public Utilizador() {}

    public Utilizador(String email, String nome, String telefone,
                      String passwordHash, TipoConta tipoConta) {
        this.email = email;
        this.nome = nome;
        this.telefone = telefone;
        this.passwordHash = passwordHash;
        this.tipoConta = tipoConta;
    }

    // Getters e setters
    public Long getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public TipoConta getTipoConta() { return tipoConta; }
    public void setTipoConta(TipoConta tipoConta) { this.tipoConta = tipoConta; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public List<Animal> getAnimais() { return animais; }
    public void setAnimais(List<Animal> animais) { this.animais = animais; }
}