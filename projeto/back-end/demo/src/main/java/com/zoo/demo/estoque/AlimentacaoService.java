package com.zoo.demo.estoque;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoo.demo.animal.Animal;
import com.zoo.demo.animal.AnimalRepository;

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
        alimentacao.setCardapio(request.getCardapio() != null && !request.getCardapio().isBlank()
            ? request.getCardapio().trim()
            : "Cardápio Semanal");
        String diaSemana = request.getDiaSemana() != null && !request.getDiaSemana().isBlank()
            ? request.getDiaSemana().trim().toUpperCase()
            : null;
        alimentacao.setDiaSemana(diaSemana != null ? diaSemana : mapearDiaSemana(LocalDate.now().getDayOfWeek()));
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

    private String mapearDiaSemana(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "SEGUNDA";
            case TUESDAY -> "TERCA";
            case WEDNESDAY -> "QUARTA";
            case THURSDAY -> "QUINTA";
            case FRIDAY -> "SEXTA";
            case SATURDAY -> "SABADO";
            case SUNDAY -> "DOMINGO";
        };
    }
}
