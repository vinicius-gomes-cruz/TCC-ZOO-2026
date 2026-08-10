package com.zoo.demo.caixa;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/caixas")
public class CaixaController {

    private final CaixaRepository repository;

    public CaixaController(CaixaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Caixa> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Caixa> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Caixa> create(@RequestBody CaixaRequest request) {
        Caixa caixa = new Caixa();
        caixa.setNumeroCaixa(request.getNumeroCaixa());
        caixa.setGrupoFemeas(request.getGrupoFemeas());
        caixa.setIdadeFemeas(request.getIdadeFemeas());
        caixa.setCrias(request.getCrias());
        caixa.setMachosRotativos(request.getMachosRotativos());

        Caixa saved = repository.save(caixa);
        return ResponseEntity.created(URI.create("/api/caixas/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Caixa> update(@PathVariable Long id, @RequestBody CaixaRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setNumeroCaixa(request.getNumeroCaixa());
                    existing.setGrupoFemeas(request.getGrupoFemeas());
                    existing.setIdadeFemeas(request.getIdadeFemeas());
                    existing.setCrias(request.getCrias());
                    existing.setMachosRotativos(request.getMachosRotativos());
                    Caixa updated = repository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repository.findById(id)
                .map(existing -> {
                    repository.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
