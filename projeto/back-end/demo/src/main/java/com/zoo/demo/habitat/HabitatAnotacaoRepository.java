package com.zoo.demo.habitat;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitatAnotacaoRepository extends JpaRepository<HabitatAnotacao, Long> {

    List<HabitatAnotacao> findAllByOrderByDataAnotacaoDescDataCriacaoDesc();

    List<HabitatAnotacao> findAllByDataAnotacaoOrderByDataCriacaoDesc(LocalDate dataAnotacao);
}
