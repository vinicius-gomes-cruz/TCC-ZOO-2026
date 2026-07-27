package com.zoo.demo.usuario;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioAuthService usuarioAuthService;

    public AuthController(UsuarioAuthService usuarioAuthService) {
        this.usuarioAuthService = usuarioAuthService;
    }

    @PostMapping("/login")
    public UsuarioLoginResponse login(@RequestBody UsuarioLoginRequest request) {
        return usuarioAuthService.login(request);
    }

    @GetMapping("/me")
    public UsuarioResponse me(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        Usuario usuario = usuarioAuthService.usuarioAutenticado(authorizationHeader);
        return UsuarioResponse.from(usuario);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        usuarioAuthService.logout(authorizationHeader);
        return ResponseEntity.noContent().build();
    }
}
