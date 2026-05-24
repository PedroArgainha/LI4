package com.patudos.service.interfaces;

import com.patudos.dto.request.ServicoRequest;
import com.patudos.dto.request.AssociarServicoRequest;
import com.patudos.dto.response.ServicoAgendadoResponse;
import com.patudos.dto.response.ServicoResponse;

import java.time.LocalDate;
import java.util.List;

public interface IGestaoServicos {

    ServicoResponse criarServico(ServicoRequest request);
    ServicoResponse editarServico(Long servicoId, ServicoRequest request);
    void toggleDisponibilidade(Long servicoId);
    void bloquearData(Long servicoId, LocalDate data);
    void desbloquearData(Long servicoId, LocalDate data);
    void removerServico(Long servicoId);

    ServicoResponse obterPorId(Long servicoId);
    List<ServicoResponse> listarTodos();
    List<ServicoResponse> listarDisponiveis();
    List<ServicoResponse> listarDisponiveis(LocalDate data);

    void associarAReserva(Long reservaId, AssociarServicoRequest request);
    void removerDeReserva(Long reservaId, Long reservaServicoId);

    ServicoAgendadoResponse marcarComoRealizado(Long reservaId, Long reservaServicoId);

    List<ServicoAgendadoResponse> listarServicosDoDia(LocalDate data);
}