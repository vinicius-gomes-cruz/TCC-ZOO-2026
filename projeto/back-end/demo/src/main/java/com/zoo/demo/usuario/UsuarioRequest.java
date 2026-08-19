package com.zoo.demo.usuario;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioRequest {

    private String nome;
    private String usuario;
    private String senha;
    private PerfilUsuario perfil;
    private Boolean ativo;
}