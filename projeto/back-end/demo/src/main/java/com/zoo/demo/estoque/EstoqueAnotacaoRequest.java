package com.zoo.demo.estoque;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EstoqueAnotacaoRequest {

    private LocalDate dataAnotacao;
    private String texto;
}
