package com.zoo.demo.estoque;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EstoqueItemRequest {

    private String tipo;
    private String nome;
    private BigDecimal quantidade;
    private String unidade;
    private LocalDate dataEntrada;
    private Integer quantidadePacotes;
    private BigDecimal pesoPorPacote;

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
