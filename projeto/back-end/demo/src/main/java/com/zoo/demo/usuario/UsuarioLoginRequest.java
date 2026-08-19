package com.zoo.demo.usuario;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioLoginRequest {

    private String usuario;
    private String senha;
}
