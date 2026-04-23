package com.patudos.service.impl;

import com.patudos.dto.request.CriarReservaRequest;
import com.patudos.dto.response.DisponibilidadeResponse;
import com.patudos.dto.response.ReservaResponse;
import com.patudos.exception.RecursoNaoEncontradoException;
import com.patudos.exception.RegraDeNegocioException;
import com.patudos.entity.Animal;
import com.patudos.entity.EspacoAlojamento;
import com.patudos.entity.Reserva;
import com.patudos.enums.Especie;
import com.patudos.enums.EstadoEspaco;
import com.patudos.enums.EstadoReserva;
import com.patudos.enums.Porte;
import com.patudos.repository.AnimalRepository;
import com.patudos.repository.EspacoAlojamentoRepository;
import com.patudos.repository.ReservaRepository;
import com.patudos.service.interfaces.IGestaoReservas;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class GestaoReservasService implements IGestaoReservas {

    // Tarifa diária base — em produção viria de configuração ou da BD
    private static final BigDecimal TARIFA_DIARIA = new BigDecimal("25.00");

    private final ReservaRepository reservaRepository;
    private final AnimalRepository animalRepository;
    private final EspacoAlojamentoRepository espacoRepository;

    public GestaoReservasService(ReservaRepository reservaRepository,
                                 AnimalRepository animalRepository,
                                 EspacoAlojamentoRepository espacoRepository) {
        this.reservaRepository = reservaRepository;
        this.animalRepository = animalRepository;
        this.espacoRepository = espacoRepository;
    }

    @Override
    public DisponibilidadeResponse verificarDisponibilidade(
            Especie especie, Porte porte,
            LocalDate dataInicio, LocalDate dataFim) {

        validarDatas(dataInicio, dataFim);
        List<EspacoAlojamento> espacos = espacoRepository
                .findEspacosDisponiveis(especie, porte, dataInicio, dataFim);

        long dias = ChronoUnit.DAYS.between(dataInicio, dataFim);
        BigDecimal precoEstimado = TARIFA_DIARIA.multiply(BigDecimal.valueOf(dias));

        return new DisponibilidadeResponse(
                !espacos.isEmpty(),
                espacos.size(),
                precoEstimado
        );
    }

    @Override
    @Transactional
    public ReservaResponse criarReserva(CriarReservaRequest request) {
        validarDatas(request.dataInicio(), request.dataFim());

        Animal animal = animalRepository.findById(request.animalId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Animal não encontrado com id: " + request.animalId()));

        // Verificar se há espaços disponíveis para este animal
        List<EspacoAlojamento> espacos = espacoRepository.findEspacosDisponiveis(
                animal.getEspecie(), animal.getPorte(),
                request.dataInicio(), request.dataFim());

        if (espacos.isEmpty()) {
            throw new RegraDeNegocioException(
                    "Não há espaços disponíveis para o período e tipo de animal indicados.");
        }

        long dias = ChronoUnit.DAYS.between(request.dataInicio(), request.dataFim());
        BigDecimal precoBase = TARIFA_DIARIA.multiply(BigDecimal.valueOf(dias));

        Reserva reserva = new Reserva(
                animal, request.dataInicio(), request.dataFim(), precoBase);

        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    @Transactional
    public ReservaResponse confirmarReserva(Long reservaId) {
        Reserva reserva = encontrarReserva(reservaId);
        garantirEstado(reserva, EstadoReserva.PENDENTE,
                "Só é possível confirmar reservas no estado PENDENTE.");

        reserva.setEstado(EstadoReserva.CONFIRMADA);
        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    @Transactional
    public ReservaResponse checkIn(Long reservaId, Long espacoId) {
        // @Transactional garante que a atualização da reserva e do espaço
        // acontece atomicamente — se qualquer passo falhar, tudo é revertido.
        Reserva reserva = encontrarReserva(reservaId);
        garantirEstado(reserva, EstadoReserva.CONFIRMADA,
                "Só é possível fazer check-in em reservas CONFIRMADAS.");

        EspacoAlojamento espaco = espacoRepository.findById(espacoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Espaço não encontrado com id: " + espacoId));

        if (!espaco.isCompativel(reserva.getAnimal().getEspecie(),
                reserva.getAnimal().getPorte())) {
            throw new RegraDeNegocioException(
                    "O espaço " + espaco.getCodigo() +
                            " não é compatível com este animal ou está ocupado.");
        }

        espaco.setEstado(EstadoEspaco.OCUPADO);
        espacoRepository.save(espaco);

        reserva.setEspaco(espaco);
        reserva.setEstado(EstadoReserva.EM_ESTADIA);
        reserva.setInstanteCheckIn(LocalDateTime.now());

        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    @Transactional
    public ReservaResponse checkOut(Long reservaId) {
        Reserva reserva = encontrarReserva(reservaId);
        garantirEstado(reserva, EstadoReserva.EM_ESTADIA,
                "Só é possível fazer check-out em reservas EM_ESTADIA.");

        // Libertar o espaço
        EspacoAlojamento espaco = reserva.getEspaco();
        espaco.setEstado(EstadoEspaco.DISPONIVEL);
        espacoRepository.save(espaco);

        reserva.setEstado(EstadoReserva.CONCLUIDA);
        reserva.setInstanteCheckOut(LocalDateTime.now());

        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    @Transactional
    public ReservaResponse cancelarReserva(Long reservaId) {
        Reserva reserva = encontrarReserva(reservaId);

        if (reserva.getEstado() == EstadoReserva.CONCLUIDA ||
                reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new RegraDeNegocioException(
                    "Não é possível cancelar uma reserva já " +
                            reserva.getEstado().name().toLowerCase() + ".");
        }

        // Se já estiver em estadia, liberta o espaço também
        if (reserva.getEstado() == EstadoReserva.EM_ESTADIA && reserva.getEspaco() != null) {
            EspacoAlojamento espaco = reserva.getEspaco();
            espaco.setEstado(EstadoEspaco.DISPONIVEL);
            espacoRepository.save(espaco);
        }

        reserva.setEstado(EstadoReserva.CANCELADA);
        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    public ReservaResponse obterPorId(Long reservaId) {
        return toResponse(encontrarReserva(reservaId));
    }

    @Override
    public List<ReservaResponse> listarPorProprietario(Long proprietarioId) {
        return reservaRepository.findByProprietarioId(proprietarioId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<ReservaResponse> listarTodas() {
        return reservaRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<ReservaResponse> listarEstadiasAtivas(LocalDate data) {
        return reservaRepository.findEstadiasAtivas(data)
                .stream().map(this::toResponse).toList();
    }

    // Auxiliares
    private Reserva encontrarReserva(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Reserva não encontrada com id: " + id));
    }

    private void garantirEstado(Reserva reserva, EstadoReserva esperado, String mensagem) {
        if (reserva.getEstado() != esperado) {
            throw new RegraDeNegocioException(mensagem);
        }
    }

    private void validarDatas(LocalDate inicio, LocalDate fim) {
        if (!inicio.isBefore(fim)) {
            throw new RegraDeNegocioException(
                    "A data de início deve ser anterior à data de fim.");
        }
        if (inicio.isBefore(LocalDate.now())) {
            throw new RegraDeNegocioException(
                    "Não é possível criar reservas para datas passadas.");
        }
    }

    private ReservaResponse toResponse(Reserva r) {
        String codigoEspaco = r.getEspaco() != null ? r.getEspaco().getCodigo() : null;
        return new ReservaResponse(
                r.getId(),
                r.getAnimal().getId(),
                r.getAnimal().getNome(),
                r.getAnimal().getProprietario().getNome(),
                codigoEspaco,
                r.getDataInicio(),
                r.getDataFim(),
                r.getEstado(),
                r.getInstanteCheckIn(),
                r.getInstanteCheckOut(),
                r.getPrecoBase(),
                r.calcularTotal()
        );
    }
}