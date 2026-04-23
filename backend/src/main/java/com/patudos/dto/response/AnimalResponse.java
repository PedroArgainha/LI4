package com.patudos.dto.response;

import com.patudos.enums.Especie;
import com.patudos.enums.Porte;
import java.time.LocalDate;

public record AnimalResponse(
        Long id,
        String nome,
        Especie especie,
        Porte porte,
        String raca,
        LocalDate dataNascimento,
        String observacoes,
        Long proprietarioId,
        String proprietarioNome
) {}