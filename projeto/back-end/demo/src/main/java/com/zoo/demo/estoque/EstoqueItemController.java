package com.zoo.demo.estoque;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

    @DeleteMapping("/itens/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        estoqueItemService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
