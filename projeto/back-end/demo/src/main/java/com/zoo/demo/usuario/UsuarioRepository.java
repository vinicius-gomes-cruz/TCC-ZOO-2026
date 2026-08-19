package com.zoo.demo.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	Optional<Usuario> findByUsuario(String usuario);

	boolean existsByUsuario(String usuario);

	long countByPerfil(PerfilUsuario perfil);

}