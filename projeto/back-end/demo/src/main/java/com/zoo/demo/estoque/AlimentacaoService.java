package com.zoo.demo.estoque;

import com.zoo.demo.animal.Animal;
import com.zoo.demo.animal.AnimalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AlimentacaoService {
    private final AlimentacaoRepository alimentacaoRepository;
    private final AnimalRepository animalRepository;

    public AlimentacaoService(AlimentacaoRepository alimentacaoRepository, AnimalRepository animalRepository) {
        this.alimentacaoRepository = alimentacaoRepository;
        this.animalRepository = animalRepository;
    }

    public Alimentacao criarAlimentacao(Long animalId, AlimentacaoRequest request) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new IllegalArgumentException("Animal não encontrado com id: " + animalId));

        Alimentacao alimentacao = new Alimentacao();
        alimentacao.setNome(request.getNome());
        alimentacao.setTipo(request.getTipo());
        alimentacao.setQuantidade(request.getQuantidade());
        alimentacao.setDataChegada(request.getDataChegada() != null ? request.getDataChegada() : LocalDate.now());
        alimentacao.setAnimal(animal);

        return alimentacaoRepository.save(alimentacao);
    }

    public List<Alimentacao> listarAlimentacoesPorAnimal(Long animalId) {
        return alimentacaoRepository.findByAnimalId(animalId);
    }

    public List<Alimentacao> listarAlimentacoesAbertasPorAnimal(Long animalId) {
        return alimentacaoRepository.findByAnimalIdAndDataTerminoIsNull(animalId);
    }

    public Optional<Alimentacao> obterAlimentacao(Long id) {
        return alimentacaoRepository.findById(id);
    }

    public Alimentacao registrarAbertura(Long alimentacaoId, LocalDate dataAbertura) {
        Alimentacao alimentacao = alimentacaoRepository.findById(alimentacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Alimentação não encontrada com id: " + alimentacaoId));

        alimentacao.setDataAbertura(dataAbertura != null ? dataAbertura : LocalDate.now());
        return alimentacaoRepository.save(alimentacao);
    }

    public Alimentacao registrarTermino(Long alimentacaoId, LocalDate dataTermino) {
        Alimentacao alimentacao = alimentacaoRepository.findById(alimentacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Alimentação não encontrada com id: " + alimentacaoId));

        alimentacao.setDataTermino(dataTermino != null ? dataTermino : LocalDate.now());
        return alimentacaoRepository.save(alimentacao);
    }

    public void deletarAlimentacao(Long id) {
        alimentacaoRepository.deleteById(id);
    }
}
