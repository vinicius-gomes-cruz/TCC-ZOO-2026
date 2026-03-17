package com.zoo.demo.habitat;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/habitats")
public class HabitatController {

    private final HabitatRepository repository;

    public HabitatController(HabitatRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Habitat> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Habitat> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Habitat> create(@RequestBody Habitat habitat) {
        Habitat saved = repository.save(habitat);
        return ResponseEntity.created(URI.create("/api/habitats/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habitat> update(@PathVariable Long id, @RequestBody Habitat habitat) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setNome(habitat.getNome());
                    existing.setDescricao(habitat.getDescricao());
                    Habitat updated = repository.save(existing);
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
