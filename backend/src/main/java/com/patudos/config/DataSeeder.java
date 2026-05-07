package com.patudos.config;

import com.patudos.entity.*;
import com.patudos.enums.*;
import com.patudos.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UtilizadorRepository utilizadorRepository;
    private final EspacoAlojamentoRepository espacoRepository;
    private final ServicoRepository servicoRepository;
    private final AnimalRepository animalRepository;
    private final ReservaRepository reservaRepository;
    private final PagamentoRepository pagamentoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UtilizadorRepository utilizadorRepository,
                      EspacoAlojamentoRepository espacoRepository,
                      ServicoRepository servicoRepository,
                      AnimalRepository animalRepository,
                      ReservaRepository reservaRepository,
                      PagamentoRepository pagamentoRepository,
                      PasswordEncoder passwordEncoder) {
        this.utilizadorRepository = utilizadorRepository;
        this.espacoRepository = espacoRepository;
        this.servicoRepository = servicoRepository;
        this.animalRepository = animalRepository;
        this.reservaRepository = reservaRepository;
        this.pagamentoRepository = pagamentoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUtilizadores();
        seedEspacos();
        seedServicos();
        seedAnimaisEReservas();
    }

    // ── Utilizadores ─────────────────────────────────────────────────────────

    private void seedUtilizadores() {
        criarUtilizador("admin@patudos.pt",       "Administrador",                    "910000000", "admin123",       TipoConta.ADMIN);
        criarUtilizador("rececao@patudos.pt",     "Sofia Oliveira",                   "920000000", "rececao123",     TipoConta.FUNC_ADMINISTRATIVO);
        criarUtilizador("operacional@patudos.pt", "Tiago Pereira",                    "930000000", "operacional123", TipoConta.FUNC_OPERACIONAL);
        criarUtilizador("direcao@patudos.pt",     "Beatriz Costa",                    "940000000", "direcao123",     TipoConta.DIRECAO);

        // Vários proprietários para popular animais e reservas
        criarUtilizador("cliente@patudos.pt",     "Cliente Teste",                    "950000000", "cliente123",     TipoConta.PROPRIETARIO);
        criarUtilizador("ana.silva@email.pt",     "Ana Silva",                        "960111222", "ana123",         TipoConta.PROPRIETARIO);
        criarUtilizador("joao.martins@email.pt",  "João Martins",                     "961333444", "joao123",        TipoConta.PROPRIETARIO);
        criarUtilizador("maria.santos@email.pt",  "Maria Santos",                     "962555666", "maria123",       TipoConta.PROPRIETARIO);
    }

    private void criarUtilizador(String email, String nome, String telefone,
                                 String password, TipoConta tipoConta) {
        if (utilizadorRepository.existsByEmail(email)) return;

        Utilizador u = new Utilizador(
                email, nome, telefone,
                passwordEncoder.encode(password), tipoConta
        );
        utilizadorRepository.save(u);
    }

    // ── Espaços de alojamento ────────────────────────────────────────────────

    private void seedEspacos() {
        if (espacoRepository.count() > 0) return;

        // Cães pequeno/médio (códigos CP)
        criarEspaco("CP1", Especie.CAO, Porte.PEQUENO_MEDIO);
        criarEspaco("CP2", Especie.CAO, Porte.PEQUENO_MEDIO);
        criarEspaco("CP3", Especie.CAO, Porte.PEQUENO_MEDIO);

        // Cães grandes (códigos CG)
        criarEspaco("CG1", Especie.CAO, Porte.GRANDE);
        criarEspaco("CG2", Especie.CAO, Porte.GRANDE);

        // Gatos (códigos GT)
        criarEspaco("GT1", Especie.GATO, Porte.NAO_APLICAVEL);
        criarEspaco("GT2", Especie.GATO, Porte.NAO_APLICAVEL);
        criarEspaco("GT3", Especie.GATO, Porte.NAO_APLICAVEL);
        criarEspaco("GT4", Especie.GATO, Porte.NAO_APLICAVEL);
    }

    private void criarEspaco(String codigo, Especie especie, Porte porte) {
        EspacoAlojamento e = new EspacoAlojamento(codigo, especie, porte);
        espacoRepository.save(e);
    }

    // ── Catálogo de serviços ─────────────────────────────────────────────────

    private void seedServicos() {
        if (servicoRepository.count() > 0) return;

        servicoRepository.save(new Servico(
                "Banho Completo",
                "Banho com champô adequado, secagem e escovagem.",
                new BigDecimal("15.00"), 5));

        servicoRepository.save(new Servico(
                "Passeio Individual (30 min)",
                "Passeio personalizado de 30 minutos no exterior.",
                new BigDecimal("8.00"), 10));

        servicoRepository.save(new Servico(
                "Corte de Unhas",
                "Corte e lima de unhas com instrumentos profissionais.",
                new BigDecimal("6.00"), 8));

        servicoRepository.save(new Servico(
                "Sessão de Brincadeira (30 min)",
                "Sessão de estimulação e brincadeira supervisionada.",
                new BigDecimal("5.00"), 12));

        servicoRepository.save(new Servico(
                "Tosquia",
                "Tosquia profissional adaptada à raça e ao pelo.",
                new BigDecimal("25.00"), 3));

        // Um serviço marcado como indisponível para testar o filtro
        Servico inactivo = new Servico(
                "Massagem Terapêutica",
                "Sessão de massagem para animais idosos ou com mobilidade reduzida.",
                new BigDecimal("20.00"), 2);
        inactivo.setDisponivel(false);
        servicoRepository.save(inactivo);
    }

    // ── Animais e reservas ───────────────────────────────────────────────────

    private void seedAnimaisEReservas() {
        if (animalRepository.count() > 0) return;

        Utilizador ana   = utilizadorRepository.findByEmail("ana.silva@email.pt").orElseThrow();
        Utilizador joao  = utilizadorRepository.findByEmail("joao.martins@email.pt").orElseThrow();
        Utilizador maria = utilizadorRepository.findByEmail("maria.santos@email.pt").orElseThrow();
        Utilizador cli   = utilizadorRepository.findByEmail("cliente@patudos.pt").orElseThrow();

        // Animais da Ana
        Animal rex = animalRepository.save(new Animal(
                "Rex", Especie.CAO, Porte.GRANDE,
                "Labrador Retriever", LocalDate.of(2020, 5, 12),
                "Muito sociável. Adora brincar com outros cães.", ana));

        Animal mel = animalRepository.save(new Animal(
                "Mel", Especie.GATO, Porte.NAO_APLICAVEL,
                "Persa", LocalDate.of(2021, 8, 3),
                "Tímida com estranhos. Toma medicação para a tiroide.", ana));

        // Animais do João
        Animal toby = animalRepository.save(new Animal(
                "Toby", Especie.CAO, Porte.PEQUENO_MEDIO,
                "Beagle", LocalDate.of(2019, 3, 22),
                "Energético. Necessita de bastante exercício diário.", joao));

        // Animais da Maria
        Animal luna = animalRepository.save(new Animal(
                "Luna", Especie.GATO, Porte.NAO_APLICAVEL,
                "Maine Coon", LocalDate.of(2022, 1, 18),
                "Muito calma. Alimentação especial para problemas digestivos.", maria));

        Animal bobby = animalRepository.save(new Animal(
                "Bobby", Especie.CAO, Porte.PEQUENO_MEDIO,
                "Caniche", LocalDate.of(2018, 11, 5),
                "Sénior. Necessita de medicação articular duas vezes ao dia.", maria));

        // Animal do cliente de teste
        animalRepository.save(new Animal(
                "Simba", Especie.GATO, Porte.NAO_APLICAVEL,
                "Sem raça definida", LocalDate.of(2023, 4, 10),
                "Amigável com humanos.", cli));

        // ── Reservas em diferentes estados ───────────────────────────────────
        LocalDate hoje = LocalDate.now();

        // 1. PENDENTE — reserva futura
        criarReserva(rex, hoje.plusDays(15), hoje.plusDays(22),
                EstadoReserva.PENDENTE, null, null);

        // 2. PENDENTE — reserva próxima, aguarda check-in
        criarReserva(toby, hoje.plusDays(3), hoje.plusDays(8),
                EstadoReserva.PENDENTE, null, null);

        // 3. EM_ESTADIA — neste momento alojado
        EspacoAlojamento gt1 = espacoRepository.findAll().stream()
                .filter(e -> e.getCodigo().equals("GT1"))
                .findFirst().orElseThrow();
        gt1.setEstado(EstadoEspaco.OCUPADO);
        espacoRepository.save(gt1);

        criarReserva(luna, hoje.minusDays(2), hoje.plusDays(5),
                EstadoReserva.EM_ESTADIA, gt1,
                hoje.minusDays(2).atTime(10, 30));

        // 4. CONCLUIDA — passada, com pagamento associado
        Reserva concluida = criarReserva(mel,
                hoje.minusDays(20), hoje.minusDays(15),
                EstadoReserva.CONCLUIDA, null,
                hoje.minusDays(20).atTime(11, 0));
        concluida.setInstanteCheckOut(hoje.minusDays(15).atTime(16, 30));
        reservaRepository.save(concluida);

        // Pagamento associado à reserva concluída
        Pagamento pag = new Pagamento(
                concluida,
                concluida.getPrecoBase(),
                "MULTIBANCO");
        pagamentoRepository.save(pag);

        // 5. CANCELADA
        criarReserva(bobby, hoje.plusDays(10), hoje.plusDays(14),
                EstadoReserva.CANCELADA, null, null);
    }

    private Reserva criarReserva(Animal animal,
                                 LocalDate inicio, LocalDate fim,
                                 EstadoReserva estado,
                                 EspacoAlojamento espaco,
                                 LocalDateTime instanteCheckIn) {
        long dias = java.time.temporal.ChronoUnit.DAYS.between(inicio, fim);
        BigDecimal preco = new BigDecimal("25.00")
                .multiply(BigDecimal.valueOf(dias));

        Reserva r = new Reserva(animal, inicio, fim, preco);
        r.setEstado(estado);
        if (espaco != null)         r.setEspaco(espaco);
        if (instanteCheckIn != null) r.setInstanteCheckIn(instanteCheckIn);
        return reservaRepository.save(r);
    }
}