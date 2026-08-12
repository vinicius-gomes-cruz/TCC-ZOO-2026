package com.zoo.demo.usuario;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository repository;
    private final UsuarioAuthService usuarioAuthService;

    public UsuarioController(UsuarioRepository repository, UsuarioAuthService usuarioAuthService) {
        this.repository = repository;
        this.usuarioAuthService = usuarioAuthService;
    }

    @GetMapping
    public List<UsuarioResponse> all(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @CookieValue(value = "accessToken", required = false) String accessTokenCookie) {
        usuarioAuthService.exigirAdministrador(resolveAuthHeader(authorizationHeader, accessTokenCookie));
        return repository.findAll().stream().map(UsuarioResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> getById(@PathVariable Long id,
                                                   @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                                   @CookieValue(value = "accessToken", required = false) String accessTokenCookie) {
        usuarioAuthService.exigirAdministrador(resolveAuthHeader(authorizationHeader, accessTokenCookie));
        return repository.findById(id)
                .map(UsuarioResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> create(@RequestBody UsuarioRequest request,
                                                  @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                                  @CookieValue(value = "accessToken", required = false) String accessTokenCookie) {
        usuarioAuthService.exigirAdministrador(resolveAuthHeader(authorizationHeader, accessTokenCookie));
        Usuario saved = usuarioAuthService.criarUsuario(request);
        return ResponseEntity.created(URI.create("/api/usuarios/" + saved.getId())).body(UsuarioResponse.from(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> update(@PathVariable Long id,
                                                  @RequestBody UsuarioRequest request,
                                                  @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                                  @CookieValue(value = "accessToken", required = false) String accessTokenCookie) {
        usuarioAuthService.exigirAdministrador(resolveAuthHeader(authorizationHeader, accessTokenCookie));
        return repository.findById(id)
                .map(existing -> {
                    Usuario updated = usuarioAuthService.atualizarUsuario(existing, request);
                    return ResponseEntity.ok(UsuarioResponse.from(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                       @CookieValue(value = "accessToken", required = false) String accessTokenCookie) {
        usuarioAuthService.exigirAdministrador(resolveAuthHeader(authorizationHeader, accessTokenCookie));
        return repository.findById(id)
                .map(existing -> {
                    existing.setAtivo(false);
                    repository.save(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String resolveAuthHeader(String authorizationHeader, String accessTokenCookie) {
        if ((authorizationHeader == null || authorizationHeader.isBlank())
                && accessTokenCookie != null
                && !accessTokenCookie.isBlank()) {
            return "Bearer " + accessTokenCookie;
        }

        return authorizationHeader;
    }
}