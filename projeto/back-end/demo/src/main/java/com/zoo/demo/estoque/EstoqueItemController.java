package com.zoo.demo.estoque;

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
public class EstoqueItemController {

    private final EstoqueItemService estoqueItemService;

    public EstoqueItemController(EstoqueItemService estoqueItemService) {
        this.estoqueItemService = estoqueItemService;
    }

    @GetMapping("/itens")
    public ResponseEntity<List<EstoqueItem>> listar(@RequestParam(required = false) String tipo) {
        try {
            return ResponseEntity.ok(estoqueItemService.listar(tipo));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/itens")
    public ResponseEntity<EstoqueItem> criar(@RequestBody EstoqueItemRequest request) {
        try {
            EstoqueItem item = estoqueItemService.criar(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/itens/{id}/adicionar-pacotes")
    public ResponseEntity<EstoqueItem> adicionarPacotes(@PathVariable Long id, @RequestBody java.util.Map<String, Integer> body) {
        try {
            Integer pacotes = body.get("pacotes");
            if (pacotes == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok(estoqueItemService.adicionarPacotes(id, pacotes));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/itens/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        estoqueItemService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/racao/disponiveis")
    public ResponseEntity<List<EstoqueItem>> listarRacoesDisponiveis() {
        return ResponseEntity.ok(estoqueItemService.listarRacoesDisponiveis());
    }

    @GetMapping("/racao/no-bioterio")
    public ResponseEntity<List<EstoqueItem>> listarRacoesNoBioterio() {
        return ResponseEntity.ok(estoqueItemService.listarRacoesNoBioterio());
    }

    @PatchMapping("/itens/{id}/enviar-bioterio")
    public ResponseEntity<EstoqueItem> enviarParaBioterio(@PathVariable Long id, @RequestBody java.util.Map<String, Integer> body) {
        try {
            Integer pacotes = body.get("pacotes");
            if (pacotes == null || pacotes <= 0) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok(estoqueItemService.enviarParaBioterio(id, pacotes));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/itens/{id}/finalizar-bioterio")
    public ResponseEntity<Void> finalizarNoBioterio(@PathVariable Long id) {
        try {
            estoqueItemService.finalizarNoBioterio(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
