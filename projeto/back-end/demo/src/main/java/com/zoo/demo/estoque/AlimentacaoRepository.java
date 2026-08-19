package com.zoo.demo.estoque;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlimentacaoRepository extends JpaRepository<Alimentacao, Long> {
    List<Alimentacao> findByHabitatId(Long habitatId);
    
    List<Alimentacao> findByHabitatIdAndDataTerminoIsNull(Long habitatId);
    boolean existsByHabitatIdAndCardapioAndDiaSemanaAndDataTerminoIsNull(Long habitatId, String cardapio, String diaSemana);
    boolean existsByHabitatIdAndCardapioAndDiaSemanaAndDataTerminoIsNullAndIdNot(Long habitatId, String cardapio, String diaSemana, Long id);
}
