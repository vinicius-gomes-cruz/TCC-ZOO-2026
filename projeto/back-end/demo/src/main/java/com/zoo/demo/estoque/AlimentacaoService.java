package com.zoo.demo.estoque;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoo.demo.habitat.Habitat;
import com.zoo.demo.habitat.HabitatRepository;

@Service
@Transactional
public class AlimentacaoService {
    private final AlimentacaoRepository alimentacaoRepository;
    private final HabitatRepository habitatRepository;

    public AlimentacaoService(AlimentacaoRepository alimentacaoRepository, HabitatRepository habitatRepository) {
        this.alimentacaoRepository = alimentacaoRepository;
        this.habitatRepository = habitatRepository;
    }

    public Alimentacao criarAlimentacaoPorHabitat(Long habitatId, AlimentacaoRequest request) {
        Habitat habitat = habitatRepository.findById(habitatId)
                .orElseThrow(() -> new IllegalArgumentException("Habitat não encontrado com id: " + habitatId));
        String cardapioName = request.getCardapio() != null && !request.getCardapio().isBlank()
            ? request.getCardapio().trim()
            : "Cardápio Semanal";
        String diaSemana = request.getDiaSemana() != null && !request.getDiaSemana().isBlank()
            ? request.getDiaSemana().trim().toUpperCase()
            : null;

        // Prevent adding more than one active alimentação for same habitat / cardápio / diaSemana
        if (diaSemana != null) {
            boolean exists = alimentacaoRepository.existsByHabitatIdAndCardapioAndDiaSemanaAndDataTerminoIsNull(habitatId, cardapioName, diaSemana);
            if (exists) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Já existe uma alimentação para este dia no cardápio selecionado");
            }
        }

        Alimentacao alimentacao = new Alimentacao();
        alimentacao.setNome(request.getNome());
        alimentacao.setTipo(request.getTipo());
        alimentacao.setCardapio(cardapioName);
        alimentacao.setDiaSemana(diaSemana != null ? diaSemana : mapearDiaSemana(LocalDate.now().getDayOfWeek()));
        alimentacao.setQuantidade(request.getQuantidade());
        alimentacao.setDataChegada(request.getDataChegada() != null ? request.getDataChegada() : LocalDate.now());
        alimentacao.setHabitat(habitat);

        return alimentacaoRepository.save(alimentacao);
    }

    public List<Alimentacao> listarAlimentacoesPorHabitat(Long habitatId) {
        return alimentacaoRepository.findByHabitatId(habitatId);
    }

    public List<Alimentacao> listarAlimentacoesAbertasPorHabitat(Long habitatId) {
        return alimentacaoRepository.findByHabitatIdAndDataTerminoIsNull(habitatId);
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

    public Alimentacao atualizarAlimentacao(Long id, AlimentacaoRequest request) {
        Alimentacao alimentacao = alimentacaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alimentação não encontrada com id: " + id));

        if (request.getNome() != null) {
            alimentacao.setNome(request.getNome());
        }
        if (request.getTipo() != null) {
            alimentacao.setTipo(request.getTipo());
        }
        String newCardapio = request.getCardapio() != null ? (request.getCardapio().trim().isEmpty() ? "Cardápio Semanal" : request.getCardapio().trim()) : alimentacao.getCardapio();
        String newDiaSemana = request.getDiaSemana() != null ? request.getDiaSemana().trim().toUpperCase() : alimentacao.getDiaSemana();

        // If changing cardapio/diaSemana, ensure no other active alimentação exists for same habitat/cardapio/diaSemana
        if (newDiaSemana != null) {
            boolean conflict = alimentacaoRepository.existsByHabitatIdAndCardapioAndDiaSemanaAndDataTerminoIsNullAndIdNot(
                    alimentacao.getHabitat().getId(), newCardapio, newDiaSemana, alimentacao.getId());
            if (conflict) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Já existe uma alimentação para este dia no cardápio selecionado");
            }
        }

        alimentacao.setCardapio(newCardapio);
        if (newDiaSemana != null) {
            alimentacao.setDiaSemana(newDiaSemana);
        }
        if (request.getQuantidade() != null) {
            alimentacao.setQuantidade(request.getQuantidade());
        }

        return alimentacaoRepository.save(alimentacao);
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
