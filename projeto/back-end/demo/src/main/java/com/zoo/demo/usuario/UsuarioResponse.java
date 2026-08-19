package com.zoo.demo.usuario;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UsuarioResponse {

    private Long id;
    private String nome;
    private String usuario;
    private PerfilUsuario perfil;
    private boolean ativo;

    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getUsuario(),
                usuario.getPerfil(),
                usuario.isAtivo()
        );
    }
}
