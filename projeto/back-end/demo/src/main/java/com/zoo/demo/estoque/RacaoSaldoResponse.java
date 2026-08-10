package com.zoo.demo.estoque;

import java.math.BigDecimal;

public class RacaoSaldoResponse {

    private final BigDecimal racaoNoEstoque;
    private final BigDecimal racaoNoBioterio;

    public RacaoSaldoResponse(BigDecimal racaoNoEstoque, BigDecimal racaoNoBioterio) {
        this.racaoNoEstoque = racaoNoEstoque;
        this.racaoNoBioterio = racaoNoBioterio;
    }

    public BigDecimal getRacaoNoEstoque() {
        return racaoNoEstoque;
    }

    public BigDecimal getRacaoNoBioterio() {
        return racaoNoBioterio;
    }
}
