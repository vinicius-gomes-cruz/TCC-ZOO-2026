package com.zoo.demo.caixa;

import com.zoo.demo.animal.Animal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    private String dataNascimento;

    private String dataDesmame;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "animal_id")
    private Animal animal;

    public Caixa() {
    }
}
