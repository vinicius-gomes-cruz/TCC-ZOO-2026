package com.zoo.demo.usuario;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UsuarioLoginResponse {

    private String accessToken;
    private String refreshToken;
    private Long id;
    private String nome;
    private String usuario;
    private PerfilUsuario perfil;
}
