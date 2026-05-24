package com.patudos.config;

import com.patudos.entity.Animal;
import com.patudos.entity.EspacoAlojamento;
import com.patudos.entity.Pagamento;
import com.patudos.entity.Reserva;
import com.patudos.entity.ReservaServico;
import com.patudos.entity.Servico;
import com.patudos.entity.Utilizador;
import com.patudos.enums.Especie;
import com.patudos.enums.EstadoEspaco;
import com.patudos.enums.EstadoReserva;
import com.patudos.enums.Porte;
import com.patudos.repository.AnimalRepository;
import com.patudos.repository.EspacoAlojamentoRepository;
import com.patudos.repository.PagamentoRepository;
import com.patudos.repository.ReservaRepository;
import com.patudos.repository.ServicoRepository;
import com.patudos.repository.UtilizadorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/* Cria
- animais do cliente teste
- reservas em vários estados
- serviços associados a reservas
- pagamentos fake
 */

// @Component
@Order(2)
public class FakeDataSeeder implements CommandLineRunner {

    private final UtilizadorRepository utilizadorRepository;
    private final AnimalRepository animalRepository;
    private final EspacoAlojamentoRepository espacoRepository;
    private final ServicoRepository servicoRepository;
    private final ReservaRepository reservaRepository;
    private final PagamentoRepository pagamentoRepository;

    public FakeDataSeeder(UtilizadorRepository utilizadorRepository,
                          AnimalRepository animalRepository,
                          EspacoAlojamentoRepository espacoRepository,
                          ServicoRepository servicoRepository,
                          ReservaRepository reservaRepository,
                          PagamentoRepository pagamentoRepository) {
        this.utilizadorRepository = utilizadorRepository;
        this.animalRepository = animalRepository;
        this.espacoRepository = espacoRepository;
        this.servicoRepository = servicoRepository;
        this.reservaRepository = reservaRepository;
        this.pagamentoRepository = pagamentoRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Utilizador cliente = obterUtilizadorPorEmail("cliente@patudos.pt");

        Animal max = criarAnimalSeNaoExistir(
                cliente,
                "Max",
                Especie.CAO,
                Porte.GRANDE,
                "Labrador Retriever",
                LocalDate.now().minusYears(4),
                "Muito sociável. Prefere passeios longos e alimentação duas vezes por dia."
        );

        Animal luna = criarAnimalSeNaoExistir(
                cliente,
                "Luna",
                Especie.GATO,
                Porte.NAO_APLICAVEL,
                "Siamês",
                LocalDate.now().minusYears(3),
                "Gata calma. Deve ficar em espaço tranquilo e evitar contacto com cães."
        );

        Animal kiko = criarAnimalSeNaoExistir(
                cliente,
                "Kiko",
                Especie.CAO,
                Porte.PEQUENO_MEDIO,
                "Beagle",
                LocalDate.now().minusYears(2),
                "Animal energético. Recomenda-se sessão de brincadeira diária."
        );

        seedReservas(max, luna, kiko);
    }

    private void seedReservas(Animal max, Animal luna, Animal kiko) {
        LocalDate hoje = LocalDate.now();

        Reserva reservaPendenteMax = criarReservaSeNaoExistir(
                max,
                hoje.plusDays(3),
                hoje.plusDays(6),
                EstadoReserva.PENDENTE,
                null,
                new BigDecimal("75.00"),
                null,
                null
        );

        Reserva reservaEmEstadiaLuna = criarReservaSeNaoExistir(
                luna,
                hoje.minusDays(1),
                hoje.plusDays(2),
                EstadoReserva.EM_ESTADIA,
                "G-01",
                new BigDecimal("75.00"),
                LocalDateTime.now().minusDays(1).withHour(10).withMinute(30),
                null
        );

        Reserva reservaConcluidaKiko = criarReservaSeNaoExistir(
                kiko,
                hoje.minusDays(20),
                hoje.minusDays(15),
                EstadoReserva.CONCLUIDA,
                "C-PM-01",
                new BigDecimal("125.00"),
                LocalDateTime.now().minusDays(20).withHour(9).withMinute(15),
                LocalDateTime.now().minusDays(15).withHour(18).withMinute(0)
        );

        Reserva reservaCanceladaMax = criarReservaSeNaoExistir(
                max,
                hoje.plusDays(15),
                hoje.plusDays(18),
                EstadoReserva.CANCELADA,
                null,
                new BigDecimal("75.00"),
                null,
                null
        );

        associarServicoSeNaoExistir(
                reservaPendenteMax,
                "Passeio Premium",
                hoje.plusDays(4)
        );

        associarServicoSeNaoExistir(
                reservaPendenteMax,
                "Banho e Grooming",
                hoje.plusDays(5)
        );

        associarServicoSeNaoExistir(
                reservaEmEstadiaLuna,
                "Spa Relaxante",
                hoje
        );

        associarServicoSeNaoExistir(
                reservaEmEstadiaLuna,
                "Alimentação Personalizada",
                hoje.plusDays(1)
        );

        associarServicoSeNaoExistir(
                reservaConcluidaKiko,
                "Sessão de Brincadeira",
                hoje.minusDays(18)
        );

        criarPagamentoSeNaoExistir(
                reservaConcluidaKiko,
                reservaConcluidaKiko.calcularTotal(),
                "MULTIBANCO",
                LocalDateTime.now().minusDays(15).withHour(18).withMinute(15)
        );

        criarPagamentoSeNaoExistir(
                reservaEmEstadiaLuna,
                new BigDecimal("75.00"),
                "NUMERARIO",
                LocalDateTime.now().minusDays(1).withHour(10).withMinute(45)
        );
    }

    private Utilizador obterUtilizadorPorEmail(String email) {
        return utilizadorRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException(
                        "Utilizador obrigatório não encontrado: " + email
                ));
    }

    private Animal criarAnimalSeNaoExistir(Utilizador proprietario,
                                           String nome,
                                           Especie especie,
                                           Porte porte,
                                           String raca,
                                           LocalDate dataNascimento,
                                           String observacoes) {
        return animalRepository.findByProprietarioId(proprietario.getId())
                .stream()
                .filter(a -> a.getNome().equalsIgnoreCase(nome))
                .findFirst()
                .orElseGet(() -> animalRepository.save(
                        new Animal(
                                nome,
                                especie,
                                porte,
                                raca,
                                dataNascimento,
                                observacoes,
                                proprietario
                        )
                ));
    }

    private Reserva criarReservaSeNaoExistir(Animal animal,
                                             LocalDate dataInicio,
                                             LocalDate dataFim,
                                             EstadoReserva estado,
                                             String codigoEspaco,
                                             BigDecimal precoBase,
                                             LocalDateTime instanteCheckIn,
                                             LocalDateTime instanteCheckOut) {
        return reservaRepository.findAll()
                .stream()
                .filter(r -> r.getAnimal().getId().equals(animal.getId()))
                .filter(r -> r.getDataInicio().equals(dataInicio))
                .filter(r -> r.getDataFim().equals(dataFim))
                .findFirst()
                .orElseGet(() -> {
                    Reserva reserva = new Reserva(animal, dataInicio, dataFim, precoBase);
                    reserva.setEstado(estado);
                    reserva.setInstanteCheckIn(instanteCheckIn);
                    reserva.setInstanteCheckOut(instanteCheckOut);

                    if (codigoEspaco != null) {
                        EspacoAlojamento espaco = obterEspacoPorCodigo(codigoEspaco);
                        reserva.setEspaco(espaco);

                        if (estado == EstadoReserva.EM_ESTADIA) {
                            espaco.setEstado(EstadoEspaco.OCUPADO);
                            espacoRepository.save(espaco);
                        }
                    }

                    return reservaRepository.save(reserva);
                });
    }

    private EspacoAlojamento obterEspacoPorCodigo(String codigo) {
        return espacoRepository.findAll()
                .stream()
                .filter(e -> e.getCodigo().equalsIgnoreCase(codigo))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Espaço obrigatório não encontrado: " + codigo
                ));
    }

    private Servico obterServicoPorNome(String nome) {
        return servicoRepository.findAll()
                .stream()
                .filter(s -> s.getNome().equalsIgnoreCase(nome))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Serviço obrigatório não encontrado: " + nome
                ));
    }

    private void associarServicoSeNaoExistir(Reserva reserva,
                                             String nomeServico,
                                             LocalDate dataExecucao) {
        Servico servico = obterServicoPorNome(nomeServico);

        boolean jaExiste = reserva.getServicos()
                .stream()
                .anyMatch(rs ->
                        rs.getServico().getId().equals(servico.getId())
                                && rs.getDataExecucao().equals(dataExecucao)
                );

        if (jaExiste) {
            return;
        }

        ReservaServico reservaServico = new ReservaServico(
                reserva,
                servico,
                dataExecucao
        );

        reserva.getServicos().add(reservaServico);
        reservaRepository.save(reserva);
    }

    private void criarPagamentoSeNaoExistir(Reserva reserva,
                                            BigDecimal valor,
                                            String metodoPagamento,
                                            LocalDateTime instantePagamento) {
        boolean jaExiste = !pagamentoRepository.findByReservaId(reserva.getId()).isEmpty();

        if (jaExiste) {
            return;
        }

        Pagamento pagamento = new Pagamento(
                reserva,
                valor,
                metodoPagamento
        );

        pagamento.setInstantePagamento(instantePagamento);
        pagamento.setCaminhoFatura(
                "faturas/fatura-reserva-" + reserva.getId() + ".pdf"
        );

        pagamentoRepository.save(pagamento);
    }
}