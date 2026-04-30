package com.patudos.config;

import com.patudos.entity.Utilizador;
import com.patudos.enums.TipoConta;
import com.patudos.repository.UtilizadorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UtilizadorRepository utilizadorRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UtilizadorRepository utilizadorRepository,
                      PasswordEncoder passwordEncoder) {
        this.utilizadorRepository = utilizadorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        criarUtilizadorSeNaoExistir(
                "admin@patudos.pt",
                "Administrador",
                "910000000",
                "admin123",
                TipoConta.ADMIN
        );

        criarUtilizadorSeNaoExistir(
                "rececao@patudos.pt",
                "Funcionário Administrativo",
                "920000000",
                "rececao123",
                TipoConta.FUNC_ADMINISTRATIVO
        );

        criarUtilizadorSeNaoExistir(
                "operacional@patudos.pt",
                "Funcionário Operacional",
                "930000000",
                "operacional123",
                TipoConta.FUNC_OPERACIONAL
        );

        criarUtilizadorSeNaoExistir(
                "direcao@patudos.pt",
                "Direção",
                "940000000",
                "direcao123",
                TipoConta.DIRECAO
        );

        criarUtilizadorSeNaoExistir(
                "cliente@patudos.pt",
                "Cliente Teste",
                "950000000",
                "cliente123",
                TipoConta.PROPRIETARIO
        );
    }

    private void criarUtilizadorSeNaoExistir(String email,
                                             String nome,
                                             String telefone,
                                             String password,
                                             TipoConta tipoConta) {
        if (utilizadorRepository.existsByEmail(email)) {
            return;
        }

        Utilizador utilizador = new Utilizador(
                email,
                nome,
                telefone,
                passwordEncoder.encode(password),
                tipoConta
        );

        utilizadorRepository.save(utilizador);
    }
}