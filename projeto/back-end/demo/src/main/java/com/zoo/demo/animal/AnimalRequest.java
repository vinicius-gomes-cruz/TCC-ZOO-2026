package com.zoo.demo.animal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnimalRequest {

    private String nome;
    private String especie;
    private Integer idade;
    private Double peso;
    private String descricao;
    private Long habitatId;
}
