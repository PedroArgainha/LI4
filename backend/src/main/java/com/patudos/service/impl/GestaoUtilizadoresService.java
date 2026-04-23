package com.patudos.service.impl;

import com.patudos.dto.request.EditarPerfilRequest;
import com.patudos.dto.request.LoginRequest;
import com.patudos.dto.request.RegistarUtilizadorRequest;
import com.patudos.dto.response.LoginResponse;
import com.patudos.dto.response.UtilizadorResponse;
import com.patudos.exception.RecursoNaoEncontradoException;
import com.patudos.exception.RegraDeNegocioException;
import com.patudos.entity.Utilizador;
import com.patudos.enums.TipoConta;
import com.patudos.repository.UtilizadorRepository;
import com.patudos.security.JwtService;
import com.patudos.service.interfaces.IGestaoUtilizadores;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class GestaoUtilizadoresService implements IGestaoUtilizadores {

    private final UtilizadorRepository utilizadorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public GestaoUtilizadoresService(UtilizadorRepository utilizadorRepository,
                                     PasswordEncoder passwordEncoder,
                                     JwtService jwtService) {
        this.utilizadorRepository = utilizadorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public UtilizadorResponse registarProprietario(RegistarUtilizadorRequest request) {
        return criarUtilizador(request, TipoConta.PROPRIETARIO);
    }

    @Override
    @Transactional
    public UtilizadorResponse criarFuncionario(RegistarUtilizadorRequest request, TipoConta tipo) {
        if (tipo == TipoConta.PROPRIETARIO) {
            throw new RegraDeNegocioException(
                    "Use registarProprietario() para criar contas de proprietários.");
        }
        return criarUtilizador(request, tipo);
    }

    private UtilizadorResponse criarUtilizador(RegistarUtilizadorRequest request, TipoConta tipo) {
        if (utilizadorRepository.existsByEmail(request.email())) {
            throw new RegraDeNegocioException(
                    "Já existe uma conta com o email: " + request.email());
        }
        Utilizador u = new Utilizador(
                request.email(),
                request.nome(),
                request.telefone(),
                passwordEncoder.encode(request.password()),
                tipo
        );
        return toResponse(utilizadorRepository.save(u));
    }

    @Override
    public LoginResponse autenticar(LoginRequest request) {
        Utilizador u = utilizadorRepository.findByEmail(request.email())
                .orElseThrow(() -> new RegraDeNegocioException("Credenciais inválidas."));

        if (!u.isAtivo()) {
            throw new RegraDeNegocioException("Esta conta foi desativada.");
        }
        if (!passwordEncoder.matches(request.password(), u.getPasswordHash())) {
            throw new RegraDeNegocioException("Credenciais inválidas.");
        }

        String token = jwtService.gerarToken(u.getEmail(), u.getTipoConta().name());
        return new LoginResponse(token, toResponse(u));
    }

    @Override
    public UtilizadorResponse obterPorId(Long id) {
        return toResponse(encontrarUtilizador(id));
    }

    @Override
    public List<UtilizadorResponse> listarTodos() {
        return utilizadorRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UtilizadorResponse editarPerfil(Long id, EditarPerfilRequest request) {
        Utilizador u = encontrarUtilizador(id);
        u.setNome(request.nome());
        u.setTelefone(request.telefone());
        return toResponse(utilizadorRepository.save(u));
    }

    @Override
    @Transactional
    public void alterarPassword(Long id, String passwordAtual, String novaPassword) {
        Utilizador u = encontrarUtilizador(id);
        if (!passwordEncoder.matches(passwordAtual, u.getPasswordHash())) {
            throw new RegraDeNegocioException("A password atual está incorreta.");
        }
        u.setPasswordHash(passwordEncoder.encode(novaPassword));
        utilizadorRepository.save(u);
    }

    @Override
    @Transactional
    public void desativarConta(Long id) {
        Utilizador u = encontrarUtilizador(id);
        u.setAtivo(false);
        utilizadorRepository.save(u);
    }

    // Método auxiliar — reutilizado internamente
    private Utilizador encontrarUtilizador(Long id) {
        return utilizadorRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Utilizador não encontrado com id: " + id));
    }

    // Converte entidade para DTO de resposta — nunca expõe o passwordHash
    private UtilizadorResponse toResponse(Utilizador u) {
        return new UtilizadorResponse(
                u.getId(),
                u.getEmail(),
                u.getNome(),
                u.getTelefone(),
                u.getTipoConta(),
                u.isAtivo()
        );
    }
}