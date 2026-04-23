package com.patudos.service.interfaces;

import com.patudos.dto.request.LoginRequest;
import com.patudos.dto.request.RegistarUtilizadorRequest;
import com.patudos.dto.request.EditarPerfilRequest;
import com.patudos.dto.response.LoginResponse;
import com.patudos.dto.response.UtilizadorResponse;
import com.patudos.enums.TipoConta;
import java.util.List;

public interface IGestaoUtilizadores {

    // Registo de proprietário (área pública)
    UtilizadorResponse registarProprietario(RegistarUtilizadorRequest request);

    // Criação de conta de funcionário (só admin)
    UtilizadorResponse criarFuncionario(RegistarUtilizadorRequest request, TipoConta tipo);

    // Autenticação — devolve JWT
    LoginResponse autenticar(LoginRequest request);

    // Consulta
    UtilizadorResponse obterPorId(Long id);
    List<UtilizadorResponse> listarTodos();

    // Edição
    UtilizadorResponse editarPerfil(Long id, EditarPerfilRequest request);
    void alterarPassword(Long id, String passwordAtual, String novaPassword);

    // Desativar conta (soft delete — mantemos o registo para integridade referencial)
    void desativarConta(Long id);
}