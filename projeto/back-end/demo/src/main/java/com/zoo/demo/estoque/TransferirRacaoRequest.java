package com.zoo.demo.estoque;

import java.math.BigDecimal;

public class TransferirRacaoRequest {

    private BigDecimal quantidade;

    public BigDecimal getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }
}
