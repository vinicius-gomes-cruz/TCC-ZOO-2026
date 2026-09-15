package com.zoo.demo.caixa;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CaixaRepository extends JpaRepository<Caixa, Long> {

	List<Caixa> findAllByOrderByIdAsc();

	List<Caixa> findAllByOrderByNumeroCaixaAsc();

	List<Caixa> findByAnimalIdOrderByNumeroCaixaAsc(Long animalId);

	Optional<Caixa> findByAnimalIdAndNumeroCaixa(Long animalId, Integer numeroCaixa);

}
