package com.zoo.demo.estoque;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EstoqueItemRepository extends JpaRepository<EstoqueItem, Long> {

    List<EstoqueItem> findByTipoOrderByDataEntradaDescIdDesc(String tipo);

    List<EstoqueItem> findByTipoOrderByDataEntradaAscIdAsc(String tipo);

    List<EstoqueItem> findAllByOrderByDataEntradaDescIdDesc();

    List<EstoqueItem> findByTipoAndNoBioterioOrderByDataEntradaDescIdDesc(String tipo, boolean noBioterio);
}
