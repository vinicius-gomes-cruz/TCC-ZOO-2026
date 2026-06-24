package com.zoo.demo.estoque;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/estoque")
@CrossOrigin(origins = "*")
public class AlimentacaoController {
    private final AlimentacaoService alimentacaoService;

    public AlimentacaoController(AlimentacaoService alimentacaoService) {
        this.alimentacaoService = alimentacaoService;
    }

    /**
     * Criar uma nova alimentação para um animal
     * POST /api/estoque/animal/{animalId}/alimentacao
     */
    @PostMapping("/animal/{animalId}/alimentacao")
    public ResponseEntity<Alimentacao> criarAlimentacao(
            @PathVariable Long animalId,
            @RequestBody AlimentacaoRequest request) {
        try {
            Alimentacao alimentacao = alimentacaoService.criarAlimentacao(animalId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(alimentacao);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Listar todas as alimentações de um animal
     * GET /api/estoque/animal/{animalId}/alimentacoes
     */
    @GetMapping("/animal/{animalId}/alimentacoes")
    public ResponseEntity<List<Alimentacao>> listarAlimentacoesPorAnimal(@PathVariable Long animalId) {
        List<Alimentacao> alimentacoes = alimentacaoService.listarAlimentacoesPorAnimal(animalId);
        return ResponseEntity.ok(alimentacoes);
    }

    /**
     * Listar alimentações abertas (ainda em uso) de um animal
     * GET /api/estoque/animal/{animalId}/alimentacoes/abertas
     */
    @GetMapping("/animal/{animalId}/alimentacoes/abertas")
    public ResponseEntity<List<Alimentacao>> listarAlimentacoesAbertas(@PathVariable Long animalId) {
        List<Alimentacao> alimentacoes = alimentacaoService.listarAlimentacoesAbertasPorAnimal(animalId);
        return ResponseEntity.ok(alimentacoes);
    }

    /**
     * Obter detalhes de uma alimentação específica
     * GET /api/estoque/alimentacao/{id}
     */
    @GetMapping("/alimentacao/{id}")
    public ResponseEntity<Alimentacao> obterAlimentacao(@PathVariable Long id) {
        return alimentacaoService.obterAlimentacao(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Registrar a data de abertura de uma alimentação
     * PATCH /api/estoque/alimentacao/{id}/abrir
     */
    @PatchMapping("/alimentacao/{id}/abrir")
    public ResponseEntity<Alimentacao> registrarAbertura(
            @PathVariable Long id,
            @RequestParam(required = false) String data) {
        try {
            LocalDate dataAbertura = (data != null) ? LocalDate.parse(data) : null;
            Alimentacao alimentacao = alimentacaoService.registrarAbertura(id, dataAbertura);
            return ResponseEntity.ok(alimentacao);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Registrar a data de término de uma alimentação
     * PATCH /api/estoque/alimentacao/{id}/terminar
     */
    @PatchMapping("/alimentacao/{id}/terminar")
    public ResponseEntity<Alimentacao> registrarTermino(
            @PathVariable Long id,
            @RequestParam(required = false) String data) {
        try {
            LocalDate dataTermino = (data != null) ? LocalDate.parse(data) : null;
            Alimentacao alimentacao = alimentacaoService.registrarTermino(id, dataTermino);
            return ResponseEntity.ok(alimentacao);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Deletar uma alimentação
     * DELETE /api/estoque/alimentacao/{id}
     */
    @DeleteMapping("/alimentacao/{id}")
    public ResponseEntity<Void> deletarAlimentacao(@PathVariable Long id) {
        alimentacaoService.deletarAlimentacao(id);
        return ResponseEntity.noContent().build();
    }
}
