package com.patudos.service.interfaces;

import com.patudos.dto.request.ServicoRequest;
import com.patudos.dto.request.AssociarServicoRequest;
import com.patudos.dto.response.ServicoResponse;
import java.time.LocalDate;
import java.util.List;

public interface IGestaoServicos {

    // Gestão do catálogo (direção / admin)
    ServicoResponse criarServico(ServicoRequest request);
    ServicoResponse editarServico(Long servicoId, ServicoRequest request);
    void toggleDisponibilidade(Long servicoId);

    // Consulta do catálogo (todos os utilizadores autenticados)
    ServicoResponse obterPorId(Long servicoId);
    List<ServicoResponse> listarTodos();
    List<ServicoResponse> listarDisponiveis();

    // Associar / remover serviço de uma reserva
    // Verifica se o serviço tem capacidade disponível para a data pedida
    void associarAReserva(Long reservaId, AssociarServicoRequest request);
    void removerDeReserva(Long reservaId, Long reservaServicoId);

    // Serviços a executar num dia específico (para funcionário operacional)
    List<ServicoResponse> listarServicosDoDia(LocalDate data);
}