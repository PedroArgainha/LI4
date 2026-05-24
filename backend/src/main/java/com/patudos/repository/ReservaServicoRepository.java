package com.patudos.repository;

import com.patudos.entity.ReservaServico;
import com.patudos.enums.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservaServicoRepository extends JpaRepository<ReservaServico, Long> {

    @Query("""
        SELECT rs FROM ReservaServico rs
        JOIN FETCH rs.servico s
        JOIN FETCH rs.reserva r
        JOIN FETCH r.animal a
        JOIN FETCH a.proprietario p
        LEFT JOIN FETCH r.espaco e
        WHERE rs.dataExecucao = :data
          AND r.estado <> :estadoCancelado
        ORDER BY rs.realizado ASC, a.nome ASC, s.nome ASC
        """)
    List<ReservaServico> findServicosAgendadosPorData(
            @Param("data") LocalDate data,
            @Param("estadoCancelado") EstadoReserva estadoCancelado
    );


    void deleteByServicoId(Long servicoId);
}