package com.patudos.service.interfaces;

import com.patudos.dto.request.EspacoRequest;
import com.patudos.dto.response.EspacoResponse;
import com.patudos.enums.Especie;
import com.patudos.enums.EstadoEspaco;
import com.patudos.enums.Porte;

import java.time.LocalDate;
import java.util.List;

public interface IGestaoEspacos {
    List<EspacoResponse> listarTodos();
    EspacoResponse obterPorId(Long espacoId);
    List<EspacoResponse> listarDisponiveis(Especie especie, Porte porte, LocalDate dataInicio, LocalDate dataFim);
    EspacoResponse criar(EspacoRequest request);
    EspacoResponse editar(Long espacoId, EspacoRequest request);
    EspacoResponse atualizarEstado(Long espacoId, EstadoEspaco estado);
}