package com.patudos.service.interfaces;

import com.patudos.dto.request.AnimalRequest;
import com.patudos.dto.response.AnimalResponse;
import java.util.List;

public interface IGestaoAnimais {

    AnimalResponse criarFicha(Long proprietarioId, AnimalRequest request);

    AnimalResponse editarFicha(Long animalId, AnimalRequest request);

    AnimalResponse obterPorId(Long animalId);

    // Proprietário vê os seus animais; funcionário pode ver todos
    List<AnimalResponse> listarPorProprietario(Long proprietarioId);
    List<AnimalResponse> listarTodos();

    void eliminar(Long animalId);
}