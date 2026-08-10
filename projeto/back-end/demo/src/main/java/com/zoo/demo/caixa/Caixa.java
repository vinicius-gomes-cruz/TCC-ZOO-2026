package com.zoo.demo.caixa;

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
public class Caixa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Integer numeroCaixa;

    private String grupoFemeas;

    private String idadeFemeas;

    @Column(columnDefinition = "TEXT")
    private String crias;

    private String machosRotativos;

    public Caixa() {
    }
}
