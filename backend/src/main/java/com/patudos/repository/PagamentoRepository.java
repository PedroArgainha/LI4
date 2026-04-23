package com.patudos.repository;

import com.patudos.entity.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

    List<Pagamento> findByReservaId(Long reservaId);

    // Para relatórios financeiros num intervalo de datas
    @Query("""
        SELECT p FROM Pagamento p
        WHERE p.instantePagamento BETWEEN :inicio AND :fim
        ORDER BY p.instantePagamento DESC
        """)
    List<Pagamento> findByPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}