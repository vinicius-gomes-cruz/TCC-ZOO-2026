package com.zoo.demo.usuario;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UsuarioBootstrapConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(UsuarioBootstrapConfig.class);

    @Bean
    CommandLineRunner criarAdministradorPadrao(UsuarioRepository usuarioRepository, UsuarioAuthService usuarioAuthService) {
        return args -> {
            if (usuarioRepository.countByPerfil(PerfilUsuario.ADMINISTRADOR) > 0) {
                return;
            }

            String usuarioAdmin = "admin";
            Usuario admin = usuarioRepository.findByUsuario(usuarioAdmin).orElseGet(Usuario::new);

            admin.setNome("Administrador");
            admin.setUsuario(usuarioAdmin);
            admin.setSenha(usuarioAuthService.encodeSenha("admin123"));
            admin.setPerfil(PerfilUsuario.ADMINISTRADOR);
            admin.setAtivo(true);

            usuarioRepository.save(admin);
            LOGGER.warn("Administrador padrão criado: {} / senha: admin123", usuarioAdmin);
        };
    }
}
