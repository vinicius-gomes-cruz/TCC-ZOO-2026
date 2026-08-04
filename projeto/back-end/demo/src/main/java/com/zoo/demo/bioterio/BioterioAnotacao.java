package com.zoo.demo.bioterio;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class BioterioAnotacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dataAnotacao;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String texto;

    private String autorNome;

    private LocalDateTime dataCriacao;

    public BioterioAnotacao() {
    }
}
