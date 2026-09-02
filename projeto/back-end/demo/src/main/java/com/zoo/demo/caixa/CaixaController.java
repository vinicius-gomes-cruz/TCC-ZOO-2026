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

import com.zoo.demo.animal.Animal;
import com.zoo.demo.animal.AnimalRepository;

@RestController
@RequestMapping("/api/caixas")
public class CaixaController {

    private final CaixaRepository repository;
    private final AnimalRepository animalRepository;

    public CaixaController(CaixaRepository repository, AnimalRepository animalRepository) {
        this.repository = repository;
        this.animalRepository = animalRepository;
    }

    @GetMapping
    public List<Caixa> all() {
        return repository.findAllByOrderByNumeroCaixaAsc();
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
        caixa.setNumeroCaixa(request.getNumeroCaixa() != null ? request.getNumeroCaixa() : proximoNumeroCaixaDisponivel());
        caixa.setGrupoFemeas(request.getGrupoFemeas());
        caixa.setIdadeFemeas(request.getIdadeFemeas());
        caixa.setCrias(request.getCrias());
        caixa.setMachosRotativos(request.getMachosRotativos());
        caixa.setDataNascimento(request.getDataNascimento());
        caixa.setDataDesmame(request.getDataDesmame());

        if (request.getAnimalId() != null) {
            Animal animal = animalRepository.findById(request.getAnimalId())
                    .orElseThrow(() -> new RuntimeException("Animal não encontrado: " + request.getAnimalId()));
            caixa.setAnimal(animal);
        } else {
            caixa.setAnimal(null);
        }

        Caixa saved = repository.save(caixa);
        return ResponseEntity.created(URI.create("/api/caixas/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Caixa> update(@PathVariable Long id, @RequestBody CaixaRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    if (request.getNumeroCaixa() != null) {
                        existing.setNumeroCaixa(request.getNumeroCaixa());
                    }
                    existing.setGrupoFemeas(request.getGrupoFemeas());
                    existing.setIdadeFemeas(request.getIdadeFemeas());
                    existing.setCrias(request.getCrias());
                    existing.setMachosRotativos(request.getMachosRotativos());
                    existing.setDataNascimento(request.getDataNascimento());
                    existing.setDataDesmame(request.getDataDesmame());

                    if (request.getAnimalId() != null) {
                        Animal animal = animalRepository.findById(request.getAnimalId())
                                .orElseThrow(() -> new RuntimeException("Animal não encontrado: " + request.getAnimalId()));
                        existing.setAnimal(animal);
                    } else {
                        existing.setAnimal(null);
                    }
                    Caixa updated = repository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Integer proximoNumeroCaixaDisponivel() {
        List<Caixa> caixas = repository.findAllByOrderByNumeroCaixaAsc();
        int proximo = 1;

        for (Caixa caixa : caixas) {
            Integer numero = caixa.getNumeroCaixa();
            if (numero == null || numero < proximo) {
                continue;
            }
            if (numero == proximo) {
                proximo++;
            } else {
                break;
            }
        }

        return proximo;
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
