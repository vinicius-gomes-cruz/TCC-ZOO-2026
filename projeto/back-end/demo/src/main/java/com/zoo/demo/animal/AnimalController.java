package com.zoo.demo.animal;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoo.demo.habitat.Habitat;
import com.zoo.demo.habitat.HabitatRepository;

@RestController
@RequestMapping("/api/animais")
public class AnimalController {

    private final AnimalRepository animalRepository;
    private final HabitatRepository habitatRepository;

    public AnimalController(AnimalRepository animalRepository, HabitatRepository habitatRepository) {
        this.animalRepository = animalRepository;
        this.habitatRepository = habitatRepository;
    }

    @GetMapping
    public List<Animal> all() {
        return animalRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Animal> getById(@PathVariable Long id) {
        return animalRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/habitat/{habitatId}")
    public List<Animal> byHabitat(@PathVariable Long habitatId) {
        return animalRepository.findByHabitatId(habitatId);
    }

    @PostMapping
    public ResponseEntity<Animal> create(@RequestBody AnimalRequest request) {
        Animal animal = new Animal();
        animal.setNomePopular(request.getNomePopular());
        animal.setNomeCientifico(request.getNomeCientifico());
        animal.setEspecie(request.getEspecie());
        animal.setNumeroMicrochipOuAnilha(request.getNumeroMicrochipOuAnilha());
        animal.setLocalizacaoMicrochip(request.getLocalizacaoMicrochip());
        animal.setApelido(request.getApelido());
        animal.setObservacaoSaude(request.getObservacaoSaude());
        animal.setTratamentosFeitos(request.getTratamentosFeitos());
        animal.setAlimentacao(request.getAlimentacao());
        animal.setCamposBioterio(request.getCamposBioterio());

        if (request.getHabitatId() != null) {
            Habitat habitat = habitatRepository.findById(request.getHabitatId())
                    .orElseThrow(() -> new RuntimeException("Habitat não encontrado: " + request.getHabitatId()));
            animal.setHabitat(habitat);
        }

        Animal saved = animalRepository.save(animal);
        return ResponseEntity.created(URI.create("/api/animais/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Animal> update(@PathVariable Long id, @RequestBody AnimalRequest request) {
        return animalRepository.findById(id)
                .map(existing -> {
                    existing.setNomePopular(request.getNomePopular());
                    existing.setNomeCientifico(request.getNomeCientifico());
                    existing.setEspecie(request.getEspecie());
                    existing.setNumeroMicrochipOuAnilha(request.getNumeroMicrochipOuAnilha());
                    existing.setLocalizacaoMicrochip(request.getLocalizacaoMicrochip());
                    existing.setApelido(request.getApelido());
                    existing.setObservacaoSaude(request.getObservacaoSaude());
                    existing.setTratamentosFeitos(request.getTratamentosFeitos());
                    existing.setAlimentacao(request.getAlimentacao());
                    existing.setCamposBioterio(request.getCamposBioterio());

                    if (request.getHabitatId() != null) {
                        Habitat habitat = habitatRepository.findById(request.getHabitatId())
                                .orElseThrow(() -> new RuntimeException("Habitat não encontrado: " + request.getHabitatId()));
                        existing.setHabitat(habitat);
                    } else {
                        existing.setHabitat(null);
                    }

                    Animal updated = animalRepository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/campos-bioterio")
    public ResponseEntity<Animal> updateCamposBioterio(@PathVariable Long id,
            @RequestBody AnimalCamposBioterioRequest request) {
        return animalRepository.findById(id)
                .map(existing -> {
                    existing.setCamposBioterio(request.getCamposBioterio());
                    Animal updated = animalRepository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return animalRepository.findById(id)
                .map(existing -> {
                    animalRepository.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
