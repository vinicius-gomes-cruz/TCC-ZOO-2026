package com.zoo.demo.habitat;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Embeddable
public class EnriquecimentoAmbiental {

    private String descricao;

    private LocalDateTime dataAdicionada;

    private LocalDateTime dataRemovida;

    public EnriquecimentoAmbiental() {
    }

    public EnriquecimentoAmbiental(String descricao, LocalDateTime dataAdicionada) {
        this.descricao = descricao;
        this.dataAdicionada = dataAdicionada;
    }
}