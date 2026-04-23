package com.patudos.repository;

import com.patudos.entity.Reserva;
import com.patudos.enums.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Reservas de um determinado proprietário (via animal)
    @Query("""
        SELECT r FROM Reserva r
        WHERE r.animal.proprietario.id = :proprietarioId
        ORDER BY r.dataInicio DESC
        """)
    List<Reserva> findByProprietarioId(@Param("proprietarioId") Long proprietarioId);

    List<Reserva> findByEstado(EstadoReserva estado);

    // Reservas ativas para o dia atual (para o mapa diário do funcionário operacional)
    @Query("""
        SELECT r FROM Reserva r
        WHERE r.estado = 'EM_ESTADIA'
          AND r.dataInicio <= :hoje
          AND r.dataFim >= :hoje
        """)
    List<Reserva> findEstadiasAtivas(@Param("hoje") LocalDate hoje);

    // Verificar se um espaço já tem reserva no período (usado para garantir consistência)
    boolean existsByEspacoIdAndEstadoInAndDataInicioLessThanAndDataFimGreaterThan(
            Long espacoId,
            List<EstadoReserva> estados,
            LocalDate dataFim,
            LocalDate dataInicio
    );
}