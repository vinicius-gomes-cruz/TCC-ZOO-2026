package com.zoo.demo.usuario;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UsuarioLoginResponse {

    private String token;
    private Long id;
    private String nome;
    private String email;
    private PerfilUsuario perfil;
}
