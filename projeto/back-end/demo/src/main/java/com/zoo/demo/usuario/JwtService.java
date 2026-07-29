package com.zoo.demo.usuario;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Service
public class JwtService {

    @Value("${app.jwt.secret:zoogestor-jwt-secret-change-this-in-production}")
    private String jwtSecret;

    @Value("${app.jwt.access-token-expiration-ms:900000}")
    private long accessTokenExpirationMs;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = tryBase64Decode(jwtSecret);
        if (keyBytes == null || keyBytes.length < 32) {
            keyBytes = sha256(jwtSecret);
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String gerarAccessToken(Usuario usuario) {
        Instant now = Instant.now();
        Instant exp = now.plusMillis(accessTokenExpirationMs);

        return Jwts.builder()
                .subject(String.valueOf(usuario.getId()))
                .claim("perfil", usuario.getPerfil().name())
                .claim("email", usuario.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(signingKey)
                .compact();
    }

    public Long extrairUsuarioId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.parseLong(claims.getSubject());
    }

    private byte[] tryBase64Decode(String value) {
        try {
            return Decoders.BASE64.decode(value);
        } catch (Exception ignored) {
            try {
                return Base64.getDecoder().decode(value);
            } catch (Exception ignoredAgain) {
                return null;
            }
        }
    }

    private byte[] sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Algoritmo SHA-256 indisponível", e);
        }
    }
}
