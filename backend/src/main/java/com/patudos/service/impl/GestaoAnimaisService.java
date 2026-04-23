package com.patudos.service.impl;

import com.patudos.dto.request.AnimalRequest;
import com.patudos.dto.response.AnimalResponse;
import com.patudos.exception.RecursoNaoEncontradoException;
import com.patudos.exception.RegraDeNegocioException;
import com.patudos.entity.Animal;
import com.patudos.entity.Utilizador;
import com.patudos.enums.Especie;
import com.patudos.enums.Porte;
import com.patudos.enums.TipoConta;
import com.patudos.repository.AnimalRepository;
import com.patudos.repository.UtilizadorRepository;
import com.patudos.service.interfaces.IGestaoAnimais;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class GestaoAnimaisService implements IGestaoAnimais {

    private final AnimalRepository animalRepository;
    private final UtilizadorRepository utilizadorRepository;

    public GestaoAnimaisService(AnimalRepository animalRepository,
                                UtilizadorRepository utilizadorRepository) {
        this.animalRepository = animalRepository;
        this.utilizadorRepository = utilizadorRepository;
    }

    @Override
    @Transactional
    public AnimalResponse criarFicha(Long proprietarioId, AnimalRequest request) {
        Utilizador proprietario = utilizadorRepository.findById(proprietarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Proprietário não encontrado com id: " + proprietarioId));

        if (proprietario.getTipoConta() != TipoConta.PROPRIETARIO) {
            throw new RegraDeNegocioException(
                    "Só é possível associar animais a contas de proprietário.");
        }

        validarPorte(request.especie(), request.porte());

        Animal animal = new Animal(
                request.nome(),
                request.especie(),
                request.porte(),
                request.raca(),
                request.dataNascimento(),
                request.observacoes(),
                proprietario
        );
        return toResponse(animalRepository.save(animal));
    }

    @Override
    @Transactional
    public AnimalResponse editarFicha(Long animalId, AnimalRequest request) {
        Animal animal = encontrarAnimal(animalId);
        validarPorte(request.especie(), request.porte());

        animal.setNome(request.nome());
        animal.setEspecie(request.especie());
        animal.setPorte(request.porte());
        animal.setRaca(request.raca());
        animal.setDataNascimento(request.dataNascimento());
        animal.setObservacoes(request.observacoes());

        return toResponse(animalRepository.save(animal));
    }

    @Override
    public AnimalResponse obterPorId(Long animalId) {
        return toResponse(encontrarAnimal(animalId));
    }

    @Override
    public List<AnimalResponse> listarPorProprietario(Long proprietarioId) {
        return animalRepository.findByProprietarioId(proprietarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<AnimalResponse> listarTodos() {
        return animalRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void eliminar(Long animalId) {
        Animal animal = encontrarAnimal(animalId);
        animalRepository.delete(animal);
    }

    // Gatos não têm porte — devem usar NAO_APLICAVEL
    private void validarPorte(Especie especie, Porte porte) {
        if (especie == Especie.GATO && porte != Porte.NAO_APLICAVEL) {
            throw new RegraDeNegocioException(
                    "Gatos não têm distinção de porte. Use NAO_APLICAVEL.");
        }
        if (especie == Especie.CAO && porte == Porte.NAO_APLICAVEL) {
            throw new RegraDeNegocioException(
                    "Cães requerem indicação de porte: PEQUENO_MEDIO ou GRANDE.");
        }
    }

    private Animal encontrarAnimal(Long id) {
        return animalRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Animal não encontrado com id: " + id));
    }

    private AnimalResponse toResponse(Animal a) {
        return new AnimalResponse(
                a.getId(),
                a.getNome(),
                a.getEspecie(),
                a.getPorte(),
                a.getRaca(),
                a.getDataNascimento(),
                a.getObservacoes(),
                a.getProprietario().getId(),
                a.getProprietario().getNome()
        );
    }
}