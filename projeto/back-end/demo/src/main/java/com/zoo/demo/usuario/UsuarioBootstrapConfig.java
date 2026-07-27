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

            String emailAdmin = "admin@zoogestor.local";
            Usuario admin = usuarioRepository.findByEmail(emailAdmin).orElseGet(Usuario::new);

            admin.setNome("Administrador");
            admin.setEmail(emailAdmin);
            admin.setSenha(usuarioAuthService.encodeSenha("admin123"));
            admin.setPerfil(PerfilUsuario.ADMINISTRADOR);

            usuarioRepository.save(admin);
            LOGGER.warn("Administrador padrão criado: {} / senha: admin123", emailAdmin);
        };
    }
}
