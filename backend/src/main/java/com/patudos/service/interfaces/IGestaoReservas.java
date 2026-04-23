package com.patudos.service.interfaces;

import com.patudos.dto.request.CriarReservaRequest;
import com.patudos.dto.response.DisponibilidadeResponse;
import com.patudos.dto.response.ReservaResponse;
import com.patudos.enums.Especie;
import com.patudos.enums.Porte;
import java.time.LocalDate;
import java.util.List;

public interface IGestaoReservas {

    // Verificar disponibilidade antes de criar
    DisponibilidadeResponse verificarDisponibilidade(
            Especie especie, Porte porte,
            LocalDate dataInicio, LocalDate dataFim);

    // Criar reserva (proprietário ou funcionário admin)
    ReservaResponse criarReserva(CriarReservaRequest request);

    // Confirmar reserva após pagamento do sinal (funcionário admin)
    ReservaResponse confirmarReserva(Long reservaId);

    // Check-in: atribui espaço e muda estado para EM_ESTADIA
    // Esta operação é @Transactional — atualiza reserva e espaço atomicamente
    ReservaResponse checkIn(Long reservaId, Long espacoId);

    // Check-out: liberta espaço e muda estado para CONCLUIDA
    ReservaResponse checkOut(Long reservaId);

    // Cancelar reserva
    ReservaResponse cancelarReserva(Long reservaId);

    // Consultas
    ReservaResponse obterPorId(Long reservaId);
    List<ReservaResponse> listarPorProprietario(Long proprietarioId);
    List<ReservaResponse> listarTodas();

    // Mapa diário para funcionário operacional
    List<ReservaResponse> listarEstadiasAtivas(LocalDate data);
}