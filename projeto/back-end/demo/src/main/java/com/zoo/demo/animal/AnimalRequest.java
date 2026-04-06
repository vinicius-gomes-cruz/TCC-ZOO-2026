package com.zoo.demo.animal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnimalRequest {

    private String nomePopular;
    private String nomeCientifico;
    private String especie;
    private String numeroMicrochipOuAnilha;
    private String localizacaoMicrochip;
    private String apelido;
    private String observacaoSaude;
    private String tratamentosFeitos;
    private String alimentacao;
    private Long habitatId;
}
