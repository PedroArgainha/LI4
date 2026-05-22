package com.patudos.service.impl;

import com.patudos.dto.request.AssociarServicoRequest;
import com.patudos.dto.request.ServicoRequest;
import com.patudos.dto.response.ServicoAgendadoResponse;
import com.patudos.dto.response.ServicoResponse;
import com.patudos.exception.RecursoNaoEncontradoException;
import com.patudos.exception.RegraDeNegocioException;
import com.patudos.entity.Reserva;
import com.patudos.entity.ReservaServico;
import com.patudos.entity.Servico;
import com.patudos.enums.EstadoReserva;
import com.patudos.repository.ReservaRepository;
import com.patudos.repository.ReservaServicoRepository;
import com.patudos.repository.ServicoRepository;
import com.patudos.service.interfaces.IGestaoServicos;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class GestaoServicosService implements IGestaoServicos {

    private final ServicoRepository servicoRepository;
    private final ReservaRepository reservaRepository;
    private final ReservaServicoRepository reservaServicoRepository;

    public GestaoServicosService(ServicoRepository servicoRepository,
                                 ReservaRepository reservaRepository,
                                 ReservaServicoRepository reservaServicoRepository) {
        this.servicoRepository = servicoRepository;
        this.reservaRepository = reservaRepository;
        this.reservaServicoRepository = reservaServicoRepository;
    }

    @Override
    @Transactional
    public ServicoResponse criarServico(ServicoRequest request) {
        Servico s = new Servico(
                request.nome(),
                request.descricao(),
                request.preco(),
                request.capacidadeDiaria()
        );
        return toResponse(servicoRepository.save(s));
    }

    @Override
    @Transactional
    public ServicoResponse editarServico(Long servicoId, ServicoRequest request) {
        Servico s = encontrarServico(servicoId);
        s.setNome(request.nome());
        s.setDescricao(request.descricao());
        s.setPreco(request.preco());
        s.setCapacidadeDiaria(request.capacidadeDiaria());
        return toResponse(servicoRepository.save(s));
    }

    @Override
    @Transactional
    public void toggleDisponibilidade(Long servicoId) {
        Servico s = encontrarServico(servicoId);
        s.setDisponivel(!s.isDisponivel());
        servicoRepository.save(s);
    }

    @Override
    public ServicoResponse obterPorId(Long servicoId) {
        return toResponse(encontrarServico(servicoId));
    }

    @Override
    public List<ServicoResponse> listarTodos() {
        return servicoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<ServicoResponse> listarDisponiveis() {
        return servicoRepository.findByDisponivelTrue().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void associarAReserva(Long reservaId, AssociarServicoRequest request) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Reserva não encontrada com id: " + reservaId));

        // Só se pode adicionar serviços a reservas ainda activas
        if (reserva.getEstado() == EstadoReserva.CONCLUIDA ||
                reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new RegraDeNegocioException(
                    "Não é possível adicionar serviços a uma reserva " +
                            reserva.getEstado().name().toLowerCase() + ".");
        }

        Servico servico = encontrarServico(request.servicoId());

        if (!servico.isDisponivel()) {
            throw new RegraDeNegocioException(
                    "O serviço '" + servico.getNome() + "' não está disponível.");
        }

        // Verificar capacidade diária — contar quantas vezes este serviço já
        // foi associado a outras reservas para a mesma data de execução
        if (servico.getCapacidadeDiaria() != null) {
            long usoNoDia = reservaRepository.findAll().stream()
                    .flatMap(r -> r.getServicos().stream())
                    .filter(rs -> rs.getServico().getId().equals(servico.getId())
                            && rs.getDataExecucao().equals(request.dataExecucao()))
                    .count();

            if (usoNoDia >= servico.getCapacidadeDiaria()) {
                throw new RegraDeNegocioException(
                        "O serviço '" + servico.getNome() +
                                "' atingiu a capacidade máxima para o dia " +
                                request.dataExecucao() + ".");
            }
        }

        // A data de execução deve estar dentro do período da reserva
        if (request.dataExecucao().isBefore(reserva.getDataInicio()) ||
                request.dataExecucao().isAfter(reserva.getDataFim())) {
            throw new RegraDeNegocioException(
                    "A data de execução do serviço deve estar dentro do período da reserva.");
        }

        ReservaServico rs = new ReservaServico(reserva, servico, request.dataExecucao());
        reserva.getServicos().add(rs);
        reservaRepository.save(reserva);
    }

    @Override
    @Transactional
    public void removerDeReserva(Long reservaId, Long reservaServicoId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Reserva não encontrada com id: " + reservaId));

        if (reserva.getEstado() == EstadoReserva.CONCLUIDA ||
                reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new RegraDeNegocioException(
                    "Não é possível remover serviços de uma reserva " +
                            reserva.getEstado().name().toLowerCase() + ".");
        }

        boolean removido = reserva.getServicos()
                .removeIf(rs -> rs.getId().equals(reservaServicoId));

        if (!removido) {
            throw new RecursoNaoEncontradoException(
                    "Serviço associado não encontrado com id: " + reservaServicoId);
        }

        reservaRepository.save(reserva);
    }

    @Override
    public List<ServicoAgendadoResponse> listarServicosDoDia(LocalDate data) {
        return reservaServicoRepository
                .findServicosAgendadosPorData(data, EstadoReserva.CANCELADA)
                .stream()
                .map(this::toServicoAgendadoResponse)
                .toList();
    }

    @Override
    @Transactional
    public ServicoAgendadoResponse marcarComoRealizado(Long reservaId, Long reservaServicoId) {
        ReservaServico rs = reservaServicoRepository.findById(reservaServicoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Serviço associado não encontrado com id: " + reservaServicoId));

        Reserva reserva = rs.getReserva();

        if (!reserva.getId().equals(reservaId)) {
            throw new RegraDeNegocioException(
                    "O serviço indicado não pertence à reserva " + reservaId + ".");
        }

        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new RegraDeNegocioException(
                    "Não é possível marcar serviços de uma reserva cancelada.");
        }

        if (rs.isRealizado()) {
            throw new RegraDeNegocioException("O serviço já foi marcado como realizado.");
        }

        rs.setRealizado(true);
        return toServicoAgendadoResponse(reservaServicoRepository.save(rs));
    }


    private ServicoAgendadoResponse toServicoAgendadoResponse(ReservaServico rs) {
        Reserva reserva = rs.getReserva();
        Servico servico = rs.getServico();

        return new ServicoAgendadoResponse(
                rs.getId(),
                reserva.getId(),
                servico.getId(),
                servico.getNome(),
                reserva.getAnimal().getId(),
                reserva.getAnimal().getNome(),
                reserva.getAnimal().getProprietario().getNome(),
                reserva.getEspaco() != null ? reserva.getEspaco().getCodigo() : null,
                rs.getDataExecucao(),
                rs.isRealizado(),
                servico.getPreco(),
                reserva.getEstado()
        );
    }

    private Servico encontrarServico(Long id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Serviço não encontrado com id: " + id));
    }

    private ServicoResponse toResponse(Servico s) {
        return new ServicoResponse(
                s.getId(),
                s.getNome(),
                s.getDescricao(),
                s.getPreco(),
                s.getCapacidadeDiaria(),
                s.isDisponivel()
        );
    }
}