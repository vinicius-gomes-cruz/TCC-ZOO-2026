package com.zoo.demo.estoque;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EstoqueAnotacaoRepository extends JpaRepository<EstoqueAnotacao, Long> {

    List<EstoqueAnotacao> findAllByOrderByDataAnotacaoDescDataCriacaoDesc();

    List<EstoqueAnotacao> findAllByDataAnotacaoOrderByDataCriacaoDesc(LocalDate dataAnotacao);
}
