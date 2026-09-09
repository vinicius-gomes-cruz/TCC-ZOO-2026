package com.zoo.demo.habitat;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HabitatAnotacaoRequest {

    private LocalDate dataAnotacao;
    private String texto;
}
