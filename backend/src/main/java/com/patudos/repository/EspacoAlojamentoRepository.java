package com.patudos.repository;

import com.patudos.entity.EspacoAlojamento;
import com.patudos.enums.Especie;
import com.patudos.enums.EstadoEspaco;
import com.patudos.enums.Porte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface EspacoAlojamentoRepository extends JpaRepository<EspacoAlojamento, Long> {

    List<EspacoAlojamento> findByEstado(EstadoEspaco estado);

    List<EspacoAlojamento> findByEspecieAndPorteAndEstado(Especie especie, Porte porte, EstadoEspaco estado);

    // Devolve espaços compatíveis que não tenham reservas sobrepostas para o período pedido.
    // Um espaço está livre se não existir nenhuma reserva em estados ativos (CONFIRMADA ou EM_ESTADIA)
    // cujo intervalo de datas intersecte [dataInicio, dataFim].
    @Query("""
        SELECT e FROM EspacoAlojamento e
        WHERE e.especie = :especie
          AND e.porte = :porte
          AND e.estado = 'DISPONIVEL'
          AND e.id NOT IN (
              SELECT r.espaco.id FROM Reserva r
              WHERE r.espaco IS NOT NULL
                AND r.estado IN ('CONFIRMADA', 'EM_ESTADIA')
                AND r.dataInicio < :dataFim
                AND r.dataFim > :dataInicio
          )
        """)
    List<EspacoAlojamento> findEspacosDisponiveis(
            @Param("especie") Especie especie,
            @Param("porte") Porte porte,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim
    );
}