package com.zoo.demo.estoque;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estoque")
public class AlimentacaoController {
    private final AlimentacaoService alimentacaoService;

    public AlimentacaoController(AlimentacaoService alimentacaoService) {
        this.alimentacaoService = alimentacaoService;
    }

    /**
     * Criar uma nova alimentação para um habitat
     * POST /api/estoque/habitat/{habitatId}/alimentacao
     */
    @PostMapping("/habitat/{habitatId}/alimentacao")
    public ResponseEntity<Alimentacao> criarAlimentacao(
            @PathVariable Long habitatId,
            @RequestBody AlimentacaoRequest request) {
        try {
            Alimentacao alimentacao = alimentacaoService.criarAlimentacaoPorHabitat(habitatId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(alimentacao);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Listar todas as alimentações de um habitat
     * GET /api/estoque/habitat/{habitatId}/alimentacoes
     */
    @GetMapping("/habitat/{habitatId}/alimentacoes")
    public ResponseEntity<List<Alimentacao>> listarAlimentacoesPorHabitat(@PathVariable Long habitatId) {
        List<Alimentacao> alimentacoes = alimentacaoService.listarAlimentacoesPorHabitat(habitatId);
        return ResponseEntity.ok(alimentacoes);
    }

    /**
     * Listar alimentações abertas (ainda em uso) de um habitat
     * GET /api/estoque/habitat/{habitatId}/alimentacoes/abertas
     */
    @GetMapping("/habitat/{habitatId}/alimentacoes/abertas")
    public ResponseEntity<List<Alimentacao>> listarAlimentacoesAbertas(@PathVariable Long habitatId) {
        List<Alimentacao> alimentacoes = alimentacaoService.listarAlimentacoesAbertasPorHabitat(habitatId);
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
