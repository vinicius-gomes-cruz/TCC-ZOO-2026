package com.zoo.demo.animal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnimalRepository extends JpaRepository<Animal, Long> {

    List<Animal> findByHabitatId(Long habitatId);
}
