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
        CommandLineRunner criarAdministradorPadrao(
        UsuarioRepository usuarioRepository,
        UsuarioAuthService usuarioAuthService) {

    return args -> {

        String usuarioAdmin = "admin";

        if (usuarioRepository.findByUsuario(usuarioAdmin).isPresent()) {
            LOGGER.info("Administrador '{}' já existe.", usuarioAdmin);
            return;
        }

        Usuario admin = new Usuario();

        admin.setNome("Administrador");
        admin.setUsuario(usuarioAdmin);
        admin.setSenha(usuarioAuthService.encodeSenha("admin123"));
        admin.setPerfil(PerfilUsuario.ADMINISTRADOR);
        admin.setAtivo(true);

        usuarioRepository.save(admin);

        LOGGER.warn("Administrador padrão criado: {} / senha: admin123",
                usuarioAdmin);
    };
}
}
