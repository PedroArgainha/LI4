package com.patudos.dto.response;

import com.patudos.enums.Especie;
import com.patudos.enums.EstadoEspaco;
import com.patudos.enums.Porte;

public record EspacoResponse(
        Long id,
        String codigo,
        Especie especie,
        Porte porte,
        EstadoEspaco estado,
        String observacoes
) {}