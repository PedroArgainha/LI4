package com.patudos.dto.request;

import com.patudos.enums.Especie;
import com.patudos.enums.EstadoEspaco;
import com.patudos.enums.Porte;

public record EspacoRequest(
        String codigo,
        Especie especie,
        Porte porte,
        EstadoEspaco estado,
        String observacoes
) {}