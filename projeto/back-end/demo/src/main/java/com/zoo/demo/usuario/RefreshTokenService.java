package com.zoo.demo.usuario;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RefreshTokenService {
    
    private final RefreshTokenRepository refreshTokenRepository;
    private final UsuarioRepository usuarioRepository;
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 30;
    
    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, 
                              UsuarioRepository usuarioRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.usuarioRepository = usuarioRepository;
    }
    
    public RefreshToken criarRefreshToken(Usuario usuario) {
        String token = gerarTokenOpacoSeguro();
        LocalDateTime expiryDate = LocalDateTime.now().plusDays(REFRESH_TOKEN_EXPIRY_DAYS);
        
        RefreshToken refreshToken = new RefreshToken(token, usuario, expiryDate);
        return refreshTokenRepository.save(refreshToken);
    }
    
    public Optional<RefreshToken> obterRefreshToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }
    
    public boolean validarRefreshToken(RefreshToken refreshToken) {
        return refreshToken != null && refreshToken.isValid();
    }
    
    public void revogarRefreshToken(RefreshToken refreshToken) {
        if (refreshToken != null) {
            refreshToken.setRevogado(true);
            refreshTokenRepository.save(refreshToken);
        }
    }
    
    public void revogarTodosTokensDoUsuario(Long usuarioId) {
        refreshTokenRepository.deleteByUsuarioId(usuarioId);
    }
    
    private String gerarTokenOpacoSeguro() {
        SecureRandom random = new SecureRandom();
        byte[] tokenBytes = new byte[32];
        random.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
}
