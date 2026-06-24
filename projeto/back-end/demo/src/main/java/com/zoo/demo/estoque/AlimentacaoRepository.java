package com.zoo.demo.estoque;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlimentacaoRepository extends JpaRepository<Alimentacao, Long> {
    List<Alimentacao> findByAnimalId(Long animalId);
    
    List<Alimentacao> findByAnimalIdAndDataTerminoIsNull(Long animalId);
}
