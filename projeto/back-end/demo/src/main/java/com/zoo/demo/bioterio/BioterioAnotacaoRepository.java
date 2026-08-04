package com.zoo.demo.bioterio;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BioterioAnotacaoRepository extends JpaRepository<BioterioAnotacao, Long> {

    List<BioterioAnotacao> findAllByOrderByDataAnotacaoDescDataCriacaoDesc();

    List<BioterioAnotacao> findAllByDataAnotacaoOrderByDataCriacaoDesc(LocalDate dataAnotacao);
}
