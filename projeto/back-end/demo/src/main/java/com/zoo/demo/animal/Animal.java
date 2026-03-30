package com.zoo.demo.animal;

import com.zoo.demo.habitat.Habitat;
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
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String especie;

    private Integer idade;

    private Double peso;

    private String descricao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "habitat_id")
    private Habitat habitat;

    public Animal() {
    }
}
