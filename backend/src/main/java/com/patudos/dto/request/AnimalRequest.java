package com.patudos.dto.request;

import com.patudos.enums.Especie;
import com.patudos.enums.Porte;
import java.time.LocalDate;

public record AnimalRequest(
        String nome,
        Especie especie,
        Porte porte,
        String raca,
        LocalDate dataNascimento,
        String observacoes
) {}