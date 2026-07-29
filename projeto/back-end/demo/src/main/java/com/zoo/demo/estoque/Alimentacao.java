package com.zoo.demo.estoque;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.zoo.demo.animal.Animal;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "alimentacao")
public class Alimentacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String tipo;
    private String cardapio;
    private String diaSemana;
    private Integer quantidade;
    private LocalDate dataChegada;
    private LocalDate dataAbertura;
    private LocalDate dataTermino;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    @JsonBackReference
    private Animal animal;

    public Alimentacao() {}

    public Alimentacao(String nome, String tipo, Integer quantidade, LocalDate dataChegada) {
        this.nome = nome;
        this.tipo = tipo;
        this.quantidade = quantidade;
        this.dataChegada = dataChegada;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCardapio() {
        return cardapio;
    }

    public void setCardapio(String cardapio) {
        this.cardapio = cardapio;
    }

    public String getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(String diaSemana) {
        this.diaSemana = diaSemana;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public LocalDate getDataChegada() {
        return dataChegada;
    }

    public void setDataChegada(LocalDate dataChegada) {
        this.dataChegada = dataChegada;
    }

    public LocalDate getDataAbertura() {
        return dataAbertura;
    }

    public void setDataAbertura(LocalDate dataAbertura) {
        this.dataAbertura = dataAbertura;
    }

    public LocalDate getDataTermino() {
        return dataTermino;
    }

    public void setDataTermino(LocalDate dataTermino) {
        this.dataTermino = dataTermino;
    }

    public Animal getAnimal() {
        return animal;
    }

    public void setAnimal(Animal animal) {
        this.animal = animal;
    }
}
