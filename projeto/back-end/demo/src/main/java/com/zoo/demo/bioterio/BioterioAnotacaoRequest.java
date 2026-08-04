package com.zoo.demo.bioterio;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BioterioAnotacaoRequest {

    private LocalDate dataAnotacao;
    private String texto;
}
