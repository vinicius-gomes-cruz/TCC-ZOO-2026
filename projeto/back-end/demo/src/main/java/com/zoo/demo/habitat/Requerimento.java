package com.zoo.demo.habitat;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Embeddable
public class Requerimento {

    private String descricao;

    private LocalDateTime dataAdicionada;

    private LocalDateTime dataRemovida;

    public Requerimento() {
    }

    public Requerimento(String descricao, LocalDateTime dataAdicionada) {
        this.descricao = descricao;
        this.dataAdicionada = dataAdicionada;
    }
}