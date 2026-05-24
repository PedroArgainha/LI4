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
import com.patudos.enums.TipoConta;
import com.patudos.repository.AnimalRepository;
import com.patudos.repository.EspacoAlojamentoRepository;
import com.patudos.repository.PagamentoRepository;
import com.patudos.repository.ReservaRepository;
import com.patudos.repository.ServicoRepository;
import com.patudos.repository.UtilizadorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Dados de demonstração para a apresentação e para screenshots do frontend.
 *
 * Este seeder é idempotente: pode correr várias vezes sem duplicar os registos
 * principais. Cria utilizadores, animais, espaços, serviços, reservas em vários
 * estados, serviços agendados e pagamentos simulados.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final BigDecimal PRECO_NOITE_CAO_PEQUENO_MEDIO = new BigDecimal("22.00");
    private static final BigDecimal PRECO_NOITE_CAO_GRANDE = new BigDecimal("28.00");
    private static final BigDecimal PRECO_NOITE_GATO = new BigDecimal("18.00");

    private final UtilizadorRepository utilizadorRepository;
    private final AnimalRepository animalRepository;
    private final EspacoAlojamentoRepository espacoRepository;
    private final ServicoRepository servicoRepository;
    private final ReservaRepository reservaRepository;
    private final PagamentoRepository pagamentoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UtilizadorRepository utilizadorRepository,
                          AnimalRepository animalRepository,
                          EspacoAlojamentoRepository espacoRepository,
                          ServicoRepository servicoRepository,
                          ReservaRepository reservaRepository,
                          PagamentoRepository pagamentoRepository,
                          PasswordEncoder passwordEncoder) {
        this.utilizadorRepository = utilizadorRepository;
        this.animalRepository = animalRepository;
        this.espacoRepository = espacoRepository;
        this.servicoRepository = servicoRepository;
        this.reservaRepository = reservaRepository;
        this.pagamentoRepository = pagamentoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUtilizadoresBase();
        seedEspacosDemo();
        seedServicosDemo();
        seedAnimaisEReservasDemo();
    }

    private void seedUtilizadoresBase() {
        criarUtilizadorSeNaoExistir("admin@patudos.pt", "Administrador", "910000000", "admin123", TipoConta.ADMIN);
        criarUtilizadorSeNaoExistir("rececao@patudos.pt", "Sofia Oliveira", "920000000", "rececao123", TipoConta.FUNC_ADMINISTRATIVO);
        criarUtilizadorSeNaoExistir("operacional@patudos.pt", "Tiago Pereira", "930000000", "operacional123", TipoConta.FUNC_OPERACIONAL);
        criarUtilizadorSeNaoExistir("direcao@patudos.pt", "Beatriz Costa", "940000000", "direcao123", TipoConta.DIRECAO);

        criarUtilizadorSeNaoExistir("cliente@patudos.pt", "Cliente Teste", "950000000", "cliente123", TipoConta.PROPRIETARIO);
        criarUtilizadorSeNaoExistir("ana.silva@email.pt", "Ana Silva", "960111222", "cliente123", TipoConta.PROPRIETARIO);
        criarUtilizadorSeNaoExistir("joao.martins@email.pt", "João Martins", "961333444", "cliente123", TipoConta.PROPRIETARIO);
        criarUtilizadorSeNaoExistir("maria.santos@email.pt", "Maria Santos", "962555666", "cliente123", TipoConta.PROPRIETARIO);
        criarUtilizadorSeNaoExistir("carolina.ferreira@email.pt", "Carolina Ferreira", "963777888", "cliente123", TipoConta.PROPRIETARIO);
        criarUtilizadorSeNaoExistir("miguel.rocha@email.pt", "Miguel Rocha", "964222333", "cliente123", TipoConta.PROPRIETARIO);
        criarUtilizadorSeNaoExistir("ines.almeida@email.pt", "Inês Almeida", "965444555", "cliente123", TipoConta.PROPRIETARIO);
        criarUtilizadorSeNaoExistir("diogo.lopes@email.pt", "Diogo Lopes", "966666777", "cliente123", TipoConta.PROPRIETARIO);
        criarUtilizadorSeNaoExistir("rita.costa@email.pt", "Rita Costa", "967888999", "cliente123", TipoConta.PROPRIETARIO);
    }

    private Utilizador criarUtilizadorSeNaoExistir(String email,
                                                   String nome,
                                                   String telefone,
                                                   String password,
                                                   TipoConta tipoConta) {
        return utilizadorRepository.findByEmail(email)
                .orElseGet(() -> utilizadorRepository.save(new Utilizador(
                        email,
                        nome,
                        telefone,
                        passwordEncoder.encode(password),
                        tipoConta
                )));
    }

    private void seedEspacosDemo() {
        criarEspacoSeNaoExistir("C-PM-01", Especie.CAO, Porte.PEQUENO_MEDIO, EstadoEspaco.DISPONIVEL,
                "Alojamento canino para cães pequenos/médios, zona interior.");
        criarEspacoSeNaoExistir("C-PM-02", Especie.CAO, Porte.PEQUENO_MEDIO, EstadoEspaco.DISPONIVEL,
                "Alojamento canino com acesso a pátio exterior.");
        criarEspacoSeNaoExistir("C-PM-03", Especie.CAO, Porte.PEQUENO_MEDIO, EstadoEspaco.DISPONIVEL,
                "Alojamento canino para animais sociáveis.");
        criarEspacoSeNaoExistir("C-PM-04", Especie.CAO, Porte.PEQUENO_MEDIO, EstadoEspaco.DISPONIVEL,
                "Box canina junto à zona de passeio.");
        criarEspacoSeNaoExistir("C-G-01", Especie.CAO, Porte.GRANDE, EstadoEspaco.DISPONIVEL,
                "Box ampla para cão de grande porte.");
        criarEspacoSeNaoExistir("C-G-02", Especie.CAO, Porte.GRANDE, EstadoEspaco.DISPONIVEL,
                "Box premium para cão de grande porte.");
        criarEspacoSeNaoExistir("C-G-03", Especie.CAO, Porte.GRANDE, EstadoEspaco.MANUTENCAO,
                "Espaço temporariamente em limpeza/manutenção.");
        criarEspacoSeNaoExistir("G-01", Especie.GATO, Porte.NAO_APLICAVEL, EstadoEspaco.DISPONIVEL,
                "Gatil individual com zona elevada.");
        criarEspacoSeNaoExistir("G-02", Especie.GATO, Porte.NAO_APLICAVEL, EstadoEspaco.DISPONIVEL,
                "Gatil individual calmo, recomendado para gatos tímidos.");
        criarEspacoSeNaoExistir("G-03", Especie.GATO, Porte.NAO_APLICAVEL, EstadoEspaco.DISPONIVEL,
                "Gatil com enriquecimento ambiental.");
        criarEspacoSeNaoExistir("G-04", Especie.GATO, Porte.NAO_APLICAVEL, EstadoEspaco.INATIVO,
                "Espaço inativo para demonstrar gestão de disponibilidade.");
    }

    private EspacoAlojamento criarEspacoSeNaoExistir(String codigo,
                                                     Especie especie,
                                                     Porte porte,
                                                     EstadoEspaco estado,
                                                     String observacoes) {
        return espacoRepository.findByCodigoIgnoreCase(codigo)
                .orElseGet(() -> {
                    EspacoAlojamento espaco = new EspacoAlojamento(codigo, especie, porte);
                    espaco.setEstado(estado);
                    espaco.setObservacoes(observacoes);
                    return espacoRepository.save(espaco);
                });
    }

    private void seedServicosDemo() {
        criarServicoSeNaoExistir("Banho Completo", "Banho com champô adequado, secagem e escovagem.", "15.00", 6, true);
        criarServicoSeNaoExistir("Passeio Individual (30 min)", "Passeio personalizado de 30 minutos no exterior.", "8.00", 12, true);
        criarServicoSeNaoExistir("Corte de Unhas", "Corte e lima de unhas com instrumentos profissionais.", "6.00", 8, true);
        criarServicoSeNaoExistir("Sessão de Brincadeira (30 min)", "Sessão de estimulação e brincadeira supervisionada.", "5.00", 15, true);
        criarServicoSeNaoExistir("Sessão de Brincadeira", "Sessão de estimulação e brincadeira supervisionada.", "5.00", 15, true);
        criarServicoSeNaoExistir("Tosquia", "Tosquia profissional adaptada à raça e ao pelo.", "25.00", 4, true);

        // Estes nomes também suportam o FakeDataSeeder antigo, caso ainda exista no projeto.
        criarServicoSeNaoExistir("Passeio Premium", "Passeio individual prolongado com acompanhamento dedicado.", "12.00", 8, true);
        criarServicoSeNaoExistir("Banho e Grooming", "Banho completo com escovagem e acabamento estético.", "22.00", 5, true);
        criarServicoSeNaoExistir("Spa Relaxante", "Sessão de relaxamento e escovagem para animais tranquilos.", "18.00", 4, true);
        criarServicoSeNaoExistir("Alimentação Personalizada", "Preparação e administração de dieta específica do animal.", "7.50", 20, true);

        criarServicoSeNaoExistir("Treino Comportamental", "Sessão curta de treino e reforço positivo.", "16.00", 3, true);
        criarServicoSeNaoExistir("Check-up de Bem-Estar", "Verificação simples de comportamento, apetite e condição geral.", "10.00", 6, true);
        criarServicoSeNaoExistir("Massagem Terapêutica", "Sessão para animais idosos ou com mobilidade reduzida.", "20.00", 2, false);
    }

    private Servico criarServicoSeNaoExistir(String nome,
                                             String descricao,
                                             String preco,
                                             Integer capacidadeDiaria,
                                             boolean disponivel) {
        return servicoRepository.findAll().stream()
                .filter(s -> s.getNome().equalsIgnoreCase(nome))
                .findFirst()
                .orElseGet(() -> {
                    Servico servico = new Servico(nome, descricao, new BigDecimal(preco), capacidadeDiaria);
                    servico.setDisponivel(disponivel);
                    return servicoRepository.save(servico);
                });
    }

    private void seedAnimaisEReservasDemo() {
        LocalDate hoje = LocalDate.now();

        Utilizador cliente = obterUtilizador("cliente@patudos.pt");
        Utilizador ana = obterUtilizador("ana.silva@email.pt");
        Utilizador joao = obterUtilizador("joao.martins@email.pt");
        Utilizador maria = obterUtilizador("maria.santos@email.pt");
        Utilizador carolina = obterUtilizador("carolina.ferreira@email.pt");
        Utilizador miguel = obterUtilizador("miguel.rocha@email.pt");
        Utilizador ines = obterUtilizador("ines.almeida@email.pt");
        Utilizador diogo = obterUtilizador("diogo.lopes@email.pt");
        Utilizador rita = obterUtilizador("rita.costa@email.pt");

        Animal max = criarAnimalSeNaoExistir(cliente, "Max", Especie.CAO, Porte.GRANDE, "Labrador Retriever",
                hoje.minusYears(4).minusMonths(2), "Muito sociável. Prefere passeios longos e alimentação duas vezes por dia.");
        Animal lunaCliente = criarAnimalSeNaoExistir(cliente, "Luna", Especie.GATO, Porte.NAO_APLICAVEL, "Siamês",
                hoje.minusYears(3).minusMonths(4), "Gata calma. Deve ficar num espaço tranquilo e evitar contacto com cães.");
        Animal kiko = criarAnimalSeNaoExistir(cliente, "Kiko", Especie.CAO, Porte.PEQUENO_MEDIO, "Beagle",
                hoje.minusYears(2).minusMonths(1), "Animal energético. Recomenda-se brincadeira diária.");
        Animal nina = criarAnimalSeNaoExistir(cliente, "Nina", Especie.GATO, Porte.NAO_APLICAVEL, "Europeu Comum",
                hoje.minusYears(1).minusMonths(7), "Muito curiosa. Usa alimentação húmida à noite.");
        Animal thor = criarAnimalSeNaoExistir(cliente, "Thor", Especie.CAO, Porte.GRANDE, "Serra da Estrela",
                hoje.minusYears(5), "Cão de grande porte, calmo, mas deve ficar em box ampla.");

        Animal rex = criarAnimalSeNaoExistir(ana, "Rex", Especie.CAO, Porte.GRANDE, "Labrador Retriever",
                LocalDate.of(2020, 5, 12), "Muito sociável. Adora brincar com outros cães.");
        Animal mel = criarAnimalSeNaoExistir(ana, "Mel", Especie.GATO, Porte.NAO_APLICAVEL, "Persa",
                LocalDate.of(2021, 8, 3), "Tímida com estranhos. Toma medicação para a tiroide.");
        Animal toby = criarAnimalSeNaoExistir(joao, "Toby", Especie.CAO, Porte.PEQUENO_MEDIO, "Beagle",
                LocalDate.of(2019, 3, 22), "Energético. Necessita de bastante exercício diário.");
        Animal bobby = criarAnimalSeNaoExistir(maria, "Bobby", Especie.CAO, Porte.PEQUENO_MEDIO, "Caniche",
                LocalDate.of(2018, 11, 5), "Sénior. Necessita de medicação articular duas vezes ao dia.");
        Animal simba = criarAnimalSeNaoExistir(carolina, "Simba", Especie.GATO, Porte.NAO_APLICAVEL, "Maine Coon",
                LocalDate.of(2022, 1, 18), "Muito calmo. Alimentação especial para problemas digestivos.");
        Animal pantufa = criarAnimalSeNaoExistir(miguel, "Pantufa", Especie.GATO, Porte.NAO_APLICAVEL, "British Shorthair",
                hoje.minusYears(6), "Gato reservado. Prefere pouca manipulação.");
        Animal pipoca = criarAnimalSeNaoExistir(ines, "Pipoca", Especie.CAO, Porte.PEQUENO_MEDIO, "Pug",
                hoje.minusYears(3), "Respiração sensível. Evitar esforço intenso em dias quentes.");
        Animal zeus = criarAnimalSeNaoExistir(diogo, "Zeus", Especie.CAO, Porte.GRANDE, "Pastor Alemão",
                hoje.minusYears(4).minusMonths(8), "Muito obediente. Gosta de rotinas fixas.");
        Animal mimi = criarAnimalSeNaoExistir(rita, "Mimi", Especie.GATO, Porte.NAO_APLICAVEL, "Europeu Comum",
                hoje.minusYears(2).minusMonths(6), "Gata brincalhona, sem necessidades especiais.");

        // Portal do cliente: várias reservas visíveis para screenshots de "As minhas reservas".
        Reserva rMaxPendente = criarReservaSeNaoExistir(max, hoje.plusDays(3), hoje.plusDays(7), EstadoReserva.PENDENTE,
                null, null, null);
        Reserva rLunaEstadia = criarReservaSeNaoExistir(lunaCliente, hoje.minusDays(1), hoje.plusDays(2), EstadoReserva.EM_ESTADIA,
                "G-01", hoje.minusDays(1).atTime(10, 30), null);
        Reserva rKikoConcluida = criarReservaSeNaoExistir(kiko, hoje.minusDays(23), hoje.minusDays(18), EstadoReserva.CONCLUIDA,
                "C-PM-01", hoje.minusDays(23).atTime(9, 15), hoje.minusDays(18).atTime(18, 0));
        Reserva rNinaPendente = criarReservaSeNaoExistir(nina, hoje.plusDays(12), hoje.plusDays(16), EstadoReserva.PENDENTE,
                null, null, null);
        Reserva rThorCancelada = criarReservaSeNaoExistir(thor, hoje.plusDays(20), hoje.plusDays(24), EstadoReserva.CANCELADA,
                null, null, null);

        // Backoffice: reservas distribuídas por estados, espécies e datas.
        Reserva rRexPendente = criarReservaSeNaoExistir(rex, hoje.plusDays(1), hoje.plusDays(5), EstadoReserva.PENDENTE,
                null, null, null);
        Reserva rMelConcluida = criarReservaSeNaoExistir(mel, hoje.minusDays(35), hoje.minusDays(30), EstadoReserva.CONCLUIDA,
                "G-02", hoje.minusDays(35).atTime(11, 0), hoje.minusDays(30).atTime(16, 45));
        Reserva rTobyPendente = criarReservaSeNaoExistir(toby, hoje.plusDays(6), hoje.plusDays(9), EstadoReserva.PENDENTE,
                null, null, null);
        Reserva rBobbyCancelada = criarReservaSeNaoExistir(bobby, hoje.plusDays(8), hoje.plusDays(11), EstadoReserva.CANCELADA,
                null, null, null);
        Reserva rSimbaEstadia = criarReservaSeNaoExistir(simba, hoje.minusDays(2), hoje.plusDays(4), EstadoReserva.EM_ESTADIA,
                "G-03", hoje.minusDays(2).atTime(12, 15), null);
        Reserva rPantufaConcluida = criarReservaSeNaoExistir(pantufa, hoje.minusDays(12), hoje.minusDays(8), EstadoReserva.CONCLUIDA,
                "G-02", hoje.minusDays(12).atTime(10, 0), hoje.minusDays(8).atTime(17, 20));
        Reserva rPipocaPendente = criarReservaSeNaoExistir(pipoca, hoje.plusDays(2), hoje.plusDays(4), EstadoReserva.PENDENTE,
                null, null, null);
        Reserva rZeusEstadia = criarReservaSeNaoExistir(zeus, hoje.minusDays(3), hoje.plusDays(1), EstadoReserva.EM_ESTADIA,
                "C-G-02", hoje.minusDays(3).atTime(9, 40), null);
        Reserva rMimiPendente = criarReservaSeNaoExistir(mimi, hoje.plusDays(14), hoje.plusDays(18), EstadoReserva.PENDENTE,
                null, null, null);

        // Serviços agendados: alguns por realizar, outros já realizados.
        associarServicoSeNaoExistir(rMaxPendente, "Passeio Premium", hoje.plusDays(4), false);
        associarServicoSeNaoExistir(rMaxPendente, "Banho e Grooming", hoje.plusDays(6), false);
        associarServicoSeNaoExistir(rLunaEstadia, "Spa Relaxante", hoje, false);
        associarServicoSeNaoExistir(rLunaEstadia, "Alimentação Personalizada", hoje.plusDays(1), false);
        associarServicoSeNaoExistir(rKikoConcluida, "Sessão de Brincadeira", hoje.minusDays(21), true);
        associarServicoSeNaoExistir(rKikoConcluida, "Corte de Unhas", hoje.minusDays(20), true);
        associarServicoSeNaoExistir(rNinaPendente, "Check-up de Bem-Estar", hoje.plusDays(13), false);
        associarServicoSeNaoExistir(rRexPendente, "Passeio Individual (30 min)", hoje.plusDays(2), false);
        associarServicoSeNaoExistir(rRexPendente, "Banho Completo", hoje.plusDays(4), false);
        associarServicoSeNaoExistir(rMelConcluida, "Alimentação Personalizada", hoje.minusDays(33), true);
        associarServicoSeNaoExistir(rTobyPendente, "Treino Comportamental", hoje.plusDays(7), false);
        associarServicoSeNaoExistir(rSimbaEstadia, "Spa Relaxante", hoje, false);
        associarServicoSeNaoExistir(rSimbaEstadia, "Check-up de Bem-Estar", hoje.plusDays(2), false);
        associarServicoSeNaoExistir(rPantufaConcluida, "Banho Completo", hoje.minusDays(10), true);
        associarServicoSeNaoExistir(rPipocaPendente, "Corte de Unhas", hoje.plusDays(3), false);
        associarServicoSeNaoExistir(rZeusEstadia, "Passeio Premium", hoje, false);
        associarServicoSeNaoExistir(rZeusEstadia, "Treino Comportamental", hoje.plusDays(1), false);
        associarServicoSeNaoExistir(rMimiPendente, "Sessão de Brincadeira (30 min)", hoje.plusDays(15), false);

        // Pagamentos para dar dados ao dashboard financeiro/relatórios.
        criarPagamentoSeNaoExistir(rKikoConcluida, rKikoConcluida.calcularTotal(), "MULTIBANCO",
                hoje.minusDays(18).atTime(18, 15));
        criarPagamentoSeNaoExistir(rMelConcluida, rMelConcluida.calcularTotal(), "TRANSFERENCIA",
                hoje.minusDays(30).atTime(17, 0));
        criarPagamentoSeNaoExistir(rPantufaConcluida, rPantufaConcluida.calcularTotal(), "NUMERARIO",
                hoje.minusDays(8).atTime(17, 35));
        criarPagamentoSeNaoExistir(rLunaEstadia, new BigDecimal("75.00"), "NUMERARIO",
                hoje.minusDays(1).atTime(10, 45));
        criarPagamentoSeNaoExistir(rZeusEstadia, new BigDecimal("120.00"), "MULTIBANCO",
                hoje.minusDays(3).atTime(10, 5));
    }

    private Utilizador obterUtilizador(String email) {
        return utilizadorRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Utilizador obrigatório não encontrado: " + email));
    }

    private Animal criarAnimalSeNaoExistir(Utilizador proprietario,
                                           String nome,
                                           Especie especie,
                                           Porte porte,
                                           String raca,
                                           LocalDate dataNascimento,
                                           String observacoes) {
        return animalRepository.findByProprietarioId(proprietario.getId()).stream()
                .filter(a -> a.getNome().equalsIgnoreCase(nome))
                .findFirst()
                .orElseGet(() -> animalRepository.save(new Animal(
                        nome,
                        especie,
                        porte,
                        raca,
                        dataNascimento,
                        observacoes,
                        proprietario
                )));
    }

    private Reserva criarReservaSeNaoExistir(Animal animal,
                                             LocalDate dataInicio,
                                             LocalDate dataFim,
                                             EstadoReserva estado,
                                             String codigoEspaco,
                                             LocalDateTime instanteCheckIn,
                                             LocalDateTime instanteCheckOut) {
        return reservaRepository.findAll().stream()
                .filter(r -> r.getAnimal().getId().equals(animal.getId()))
                .filter(r -> r.getDataInicio().equals(dataInicio))
                .filter(r -> r.getDataFim().equals(dataFim))
                .findFirst()
                .orElseGet(() -> {
                    Reserva reserva = new Reserva(
                            animal,
                            dataInicio,
                            dataFim,
                            calcularPrecoBase(animal, dataInicio, dataFim)
                    );
                    reserva.setEstado(estado);
                    reserva.setInstanteCheckIn(instanteCheckIn);
                    reserva.setInstanteCheckOut(instanteCheckOut);

                    if (codigoEspaco != null) {
                        EspacoAlojamento espaco = obterEspaco(codigoEspaco);
                        reserva.setEspaco(espaco);

                        if (estado == EstadoReserva.EM_ESTADIA) {
                            espaco.setEstado(EstadoEspaco.OCUPADO);
                            espacoRepository.save(espaco);
                        }
                    }

                    return reservaRepository.save(reserva);
                });
    }

    private BigDecimal calcularPrecoBase(Animal animal, LocalDate dataInicio, LocalDate dataFim) {
        long noites = Math.max(1, ChronoUnit.DAYS.between(dataInicio, dataFim));
        BigDecimal precoNoite;

        if (animal.getEspecie() == Especie.GATO) {
            precoNoite = PRECO_NOITE_GATO;
        } else if (animal.getPorte() == Porte.GRANDE) {
            precoNoite = PRECO_NOITE_CAO_GRANDE;
        } else {
            precoNoite = PRECO_NOITE_CAO_PEQUENO_MEDIO;
        }

        return precoNoite.multiply(BigDecimal.valueOf(noites));
    }

    private EspacoAlojamento obterEspaco(String codigo) {
        return espacoRepository.findByCodigoIgnoreCase(codigo)
                .orElseThrow(() -> new IllegalStateException("Espaço obrigatório não encontrado: " + codigo));
    }

    private Servico obterServico(String nome) {
        return servicoRepository.findAll().stream()
                .filter(s -> s.getNome().equalsIgnoreCase(nome))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Serviço obrigatório não encontrado: " + nome));
    }

    private void associarServicoSeNaoExistir(Reserva reserva,
                                             String nomeServico,
                                             LocalDate dataExecucao,
                                             boolean realizado) {
        Servico servico = obterServico(nomeServico);

        boolean jaExiste = reserva.getServicos().stream()
                .anyMatch(rs -> rs.getServico().getId().equals(servico.getId())
                        && dataExecucao.equals(rs.getDataExecucao()));

        if (jaExiste) {
            return;
        }

        ReservaServico reservaServico = new ReservaServico(reserva, servico, dataExecucao);
        reservaServico.setRealizado(realizado);
        reserva.getServicos().add(reservaServico);
        reservaRepository.save(reserva);
    }

    private void criarPagamentoSeNaoExistir(Reserva reserva,
                                            BigDecimal valor,
                                            String metodoPagamento,
                                            LocalDateTime instantePagamento) {
        if (!pagamentoRepository.findByReservaId(reserva.getId()).isEmpty()) {
            return;
        }

        Pagamento pagamento = new Pagamento(reserva, valor, metodoPagamento);
        pagamento.setInstantePagamento(instantePagamento);
        pagamento.setCaminhoFatura("faturas/fatura-reserva-" + reserva.getId() + ".pdf");
        pagamentoRepository.save(pagamento);
    }
}