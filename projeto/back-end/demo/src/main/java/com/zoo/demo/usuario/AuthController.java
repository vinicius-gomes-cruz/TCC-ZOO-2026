package com.zoo.demo.usuario;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private final UsuarioAuthService usuarioAuthService;

    public AuthController(UsuarioAuthService usuarioAuthService) {
        this.usuarioAuthService = usuarioAuthService;
    }

    @PostMapping("/login")
    public UsuarioLoginResponse login(@RequestBody UsuarioLoginRequest request, HttpServletResponse response) {
        UsuarioLoginResponse loginResponse = usuarioAuthService.login(request);
        
        adicionarCookies(response, loginResponse);
        
        return loginResponse;
    }

    @PostMapping("/refresh")
    public UsuarioLoginResponse refresh(@CookieValue(value = "refreshToken", required = false) String refreshToken, 
                                        HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token ausente");
        }
        
        UsuarioLoginResponse loginResponse = usuarioAuthService.refresh(refreshToken);
        
        adicionarCookies(response, loginResponse);
        
        return loginResponse;
    }

    @GetMapping("/me")
    public UsuarioResponse me(@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                              @CookieValue(value = "accessToken", required = false) String accessTokenCookie) {
        String tokenHeader = authorizationHeader;
        if ((tokenHeader == null || tokenHeader.isBlank()) && accessTokenCookie != null && !accessTokenCookie.isBlank()) {
            tokenHeader = "Bearer " + accessTokenCookie;
        }

        Usuario usuario = usuarioAuthService.usuarioAutenticado(tokenHeader);
        return UsuarioResponse.from(usuario);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(value = "refreshToken", required = false) String refreshToken,
                                      HttpServletResponse response) {
        usuarioAuthService.logout(refreshToken);
        
        removerCookies(response);
        
        return ResponseEntity.noContent().build();
    }

    private void adicionarCookies(HttpServletResponse response, UsuarioLoginResponse loginResponse) {
        response.addHeader("Set-Cookie", String.format(
            "accessToken=%s; Path=/; Max-Age=900; HttpOnly; SameSite=Strict",
            loginResponse.getAccessToken()
        ));
        
        response.addHeader("Set-Cookie", String.format(
            "refreshToken=%s; Path=/; Max-Age=2592000; HttpOnly; SameSite=Strict",
            loginResponse.getRefreshToken()
        ));
    }

    private void removerCookies(HttpServletResponse response) {
        response.addHeader("Set-Cookie", "accessToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict");
        response.addHeader("Set-Cookie", "refreshToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict");
    }
}
