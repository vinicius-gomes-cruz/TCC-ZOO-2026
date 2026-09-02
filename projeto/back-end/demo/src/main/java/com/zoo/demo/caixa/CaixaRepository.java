package com.zoo.demo.caixa;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CaixaRepository extends JpaRepository<Caixa, Long> {

	List<Caixa> findAllByOrderByIdAsc();

	List<Caixa> findAllByOrderByNumeroCaixaAsc();

}
