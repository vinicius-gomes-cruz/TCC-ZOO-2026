package com.zoo.demo.habitat;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
public class Habitat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String descricao;

    @ElementCollection
    @CollectionTable(name = "habitat_requerimentos", joinColumns = @JoinColumn(name = "habitat_id"))
    @Column(name = "requerimento")
    private List<String> requerimentos = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "habitat_animais", joinColumns = @JoinColumn(name = "habitat_id"))
    @Column(name = "animal")
    private List<String> animais = new ArrayList<>();

    public Habitat() {
    }

    public Habitat(Long id, String nome, String descricao) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
    }
}
