package com.patudos.repository;

import com.patudos.entity.ServicoIndisponibilidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface ServicoIndisponibilidadeRepository extends JpaRepository<ServicoIndisponibilidade, Long> {

    boolean existsByServicoIdAndData(Long servicoId, LocalDate data);

    void deleteByServicoIdAndData(Long servicoId, LocalDate data);

    void deleteByServicoId(Long servicoId);

    List<ServicoIndisponibilidade> findByServicoIdOrderByDataAsc(Long servicoId);

    List<ServicoIndisponibilidade> findByServicoIdIn(Collection<Long> servicoIds);
}