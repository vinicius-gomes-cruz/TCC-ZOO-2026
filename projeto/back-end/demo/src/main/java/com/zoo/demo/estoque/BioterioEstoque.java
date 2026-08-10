package com.zoo.demo.estoque;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bioterio_estoque")
public class BioterioEstoque {

    @Id
    private Long id;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal quantidadeRacao;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getQuantidadeRacao() {
        return quantidadeRacao;
    }

    public void setQuantidadeRacao(BigDecimal quantidadeRacao) {
        this.quantidadeRacao = quantidadeRacao;
    }
}
