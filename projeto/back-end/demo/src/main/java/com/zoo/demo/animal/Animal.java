package com.zoo.demo.animal;

import com.zoo.demo.habitat.Habitat;
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
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomePopular;

    private String nomeCientifico;

    private String especie;

    private String numeroMicrochipOuAnilha;

    private String localizacaoMicrochip;

    private String apelido;

    @Column(columnDefinition = "TEXT")
    private String observacaoSaude;

    @Column(columnDefinition = "TEXT")
    private String tratamentosFeitos;

    @Column(columnDefinition = "TEXT")
    private String alimentacao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "habitat_id")
    private Habitat habitat;

    public Animal() {
    }
}
