package com.zoo.demo.estoque;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "estoque_item")
public class EstoqueItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;

    private String nome;

    @Column(precision = 14, scale = 2)
    private BigDecimal quantidade;

    private String unidade;

    private LocalDate dataEntrada;

    private boolean noBioterio;

    private Integer quantidadePacotes;

    @Column(precision = 14, scale = 2)
    private BigDecimal pesoPorPacote;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public BigDecimal getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }

    public String getUnidade() {
        return unidade;
    }

    public void setUnidade(String unidade) {
        this.unidade = unidade;
    }

    public LocalDate getDataEntrada() {
        return dataEntrada;
    }

    public void setDataEntrada(LocalDate dataEntrada) {
        this.dataEntrada = dataEntrada;
    }

    public boolean isNoBioterio() {
        return noBioterio;
    }

    public void setNoBioterio(boolean noBioterio) {
        this.noBioterio = noBioterio;
    }

    public Integer getQuantidadePacotes() {
        return quantidadePacotes;
    }

    public void setQuantidadePacotes(Integer quantidadePacotes) {
        this.quantidadePacotes = quantidadePacotes;
    }

    public BigDecimal getPesoPorPacote() {
        return pesoPorPacote;
    }

    public void setPesoPorPacote(BigDecimal pesoPorPacote) {
        this.pesoPorPacote = pesoPorPacote;
    }
}
