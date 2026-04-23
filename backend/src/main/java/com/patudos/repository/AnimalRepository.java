package com.patudos.repository;

import com.patudos.entity.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnimalRepository extends JpaRepository<Animal, Long> {

    List<Animal> findByProprietarioId(Long proprietarioId);

    List<Animal> findByProprietarioIdAndNomeContainingIgnoreCase(Long proprietarioId, String nome);
}   