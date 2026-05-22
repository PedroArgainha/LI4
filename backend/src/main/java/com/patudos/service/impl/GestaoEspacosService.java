package com.patudos.service.impl;

import com.patudos.dto.request.EspacoRequest;
import com.patudos.dto.response.EspacoResponse;
import com.patudos.entity.EspacoAlojamento;
import com.patudos.enums.Especie;
import com.patudos.enums.EstadoEspaco;
import com.patudos.enums.EstadoReserva;
import com.patudos.enums.Porte;
import com.patudos.exception.RecursoNaoEncontradoException;
import com.patudos.exception.RegraDeNegocioException;
import com.patudos.repository.EspacoAlojamentoRepository;
import com.patudos.repository.ReservaRepository;
import com.patudos.service.interfaces.IGestaoEspacos;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class GestaoEspacosService implements IGestaoEspacos {

    private final EspacoAlojamentoRepository espacoRepository;
    private final ReservaRepository reservaRepository;

    public GestaoEspacosService(EspacoAlojamentoRepository espacoRepository,
                                ReservaRepository reservaRepository) {
        this.espacoRepository = espacoRepository;
        this.reservaRepository = reservaRepository;
    }

    @Override
    public List<EspacoResponse> listarTodos() {
        return espacoRepository.findAll().stream()
                .sorted(Comparator.comparing(EspacoAlojamento::getCodigo))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EspacoResponse obterPorId(Long espacoId) {
        return toResponse(encontrarEspaco(espacoId));
    }

    @Override
    public List<EspacoResponse> listarDisponiveis(Especie especie,
                                                  Porte porte,
                                                  LocalDate dataInicio,
                                                  LocalDate dataFim) {
        validarDatas(dataInicio, dataFim);
        validarCompatibilidade(especie, porte);

        return espacoRepository.findEspacosDisponiveis(especie, porte, dataInicio, dataFim)
                .stream()
                .sorted(Comparator.comparing(EspacoAlojamento::getCodigo))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public EspacoResponse criar(EspacoRequest request) {
        validarRequest(request);

        String codigo = normalizarCodigo(request.codigo());
        if (espacoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new RegraDeNegocioException("Já existe um espaço com o código " + codigo + ".");
        }

        EspacoAlojamento espaco = new EspacoAlojamento(codigo, request.especie(), request.porte());
        espaco.setEstado(request.estado() != null ? request.estado() : EstadoEspaco.DISPONIVEL);
        espaco.setObservacoes(normalizarTexto(request.observacoes()));

        return toResponse(espacoRepository.save(espaco));
    }

    @Override
    @Transactional
    public EspacoResponse editar(Long espacoId, EspacoRequest request) {
        validarRequest(request);

        EspacoAlojamento espaco = encontrarEspaco(espacoId);
        String codigo = normalizarCodigo(request.codigo());

        espacoRepository.findByCodigoIgnoreCase(codigo)
                .filter(e -> !e.getId().equals(espacoId))
                .ifPresent(e -> {
                    throw new RegraDeNegocioException("Já existe um espaço com o código " + codigo + ".");
                });

        espaco.setCodigo(codigo);
        espaco.setEspecie(request.especie());
        espaco.setPorte(request.porte());
        espaco.setEstado(request.estado() != null ? request.estado() : espaco.getEstado());
        espaco.setObservacoes(normalizarTexto(request.observacoes()));

        return toResponse(espacoRepository.save(espaco));
    }

    @Override
    @Transactional
    public EspacoResponse atualizarEstado(Long espacoId, EstadoEspaco estado) {
        if (estado == null) {
            throw new RegraDeNegocioException("O estado do espaço é obrigatório.");
        }

        EspacoAlojamento espaco = encontrarEspaco(espacoId);

        if (estado == EstadoEspaco.DISPONIVEL && temReservaAtivaNoEspaco(espacoId)) {
            throw new RegraDeNegocioException(
                    "Não é possível marcar como disponível um espaço associado a uma estadia ativa.");
        }

        espaco.setEstado(estado);
        return toResponse(espacoRepository.save(espaco));
    }

    private EspacoAlojamento encontrarEspaco(Long id) {
        return espacoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Espaço de alojamento não encontrado com id: " + id));
    }

    private void validarRequest(EspacoRequest request) {
        if (request == null) {
            throw new RegraDeNegocioException("Os dados do espaço são obrigatórios.");
        }
        if (request.codigo() == null || request.codigo().trim().isEmpty()) {
            throw new RegraDeNegocioException("O código do espaço é obrigatório.");
        }
        if (request.especie() == null) {
            throw new RegraDeNegocioException("A espécie compatível do espaço é obrigatória.");
        }
        if (request.porte() == null) {
            throw new RegraDeNegocioException("O porte compatível do espaço é obrigatório.");
        }
        validarCompatibilidade(request.especie(), request.porte());
    }

    private void validarCompatibilidade(Especie especie, Porte porte) {
        if (especie == Especie.GATO && porte != Porte.NAO_APLICAVEL) {
            throw new RegraDeNegocioException(
                    "Espaços para gatos devem usar o porte NAO_APLICAVEL.");
        }
        if (especie == Especie.CAO && porte == Porte.NAO_APLICAVEL) {
            throw new RegraDeNegocioException(
                    "Espaços para cães devem indicar PEQUENO_MEDIO ou GRANDE.");
        }
    }

    private void validarDatas(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null) {
            throw new RegraDeNegocioException("As datas de início e fim são obrigatórias.");
        }
        if (!inicio.isBefore(fim)) {
            throw new RegraDeNegocioException("A data de início deve ser anterior à data de fim.");
        }
    }

    private boolean temReservaAtivaNoEspaco(Long espacoId) {
        return reservaRepository.findAll().stream()
                .filter(r -> r.getEspaco() != null && r.getEspaco().getId().equals(espacoId))
                .anyMatch(r -> r.getEstado() == EstadoReserva.EM_ESTADIA);
    }

    private String normalizarCodigo(String codigo) {
        return codigo.trim().toUpperCase();
    }

    private String normalizarTexto(String texto) {
        return texto == null || texto.trim().isEmpty() ? null : texto.trim();
    }

    private EspacoResponse toResponse(EspacoAlojamento e) {
        return new EspacoResponse(
                e.getId(),
                e.getCodigo(),
                e.getEspecie(),
                e.getPorte(),
                e.getEstado(),
                e.getObservacoes()
        );
    }
}