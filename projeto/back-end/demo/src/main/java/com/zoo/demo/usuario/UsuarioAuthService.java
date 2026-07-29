package com.zoo.demo.usuario;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import io.jsonwebtoken.JwtException;

@Service
public class UsuarioAuthService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioAuthService(UsuarioRepository usuarioRepository, 
                            JwtService jwtService,
                            RefreshTokenService refreshTokenService) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public UsuarioLoginResponse login(UsuarioLoginRequest request) {
        String email = normalize(request.getEmail());
        String senha = request.getSenha() == null ? "" : request.getSenha().trim();

        if (email.isBlank() || senha.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail e senha são obrigatórios");
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));

        String senhaSalva = usuario.getSenha() == null ? "" : usuario.getSenha();
        boolean senhaValida = passwordEncoder.matches(senha, senhaSalva);

        if (!senhaValida && !senhaSalva.startsWith("$2") && senha.equals(senhaSalva)) {
            usuario.setSenha(passwordEncoder.encode(senha));
            usuarioRepository.save(usuario);
            senhaValida = true;
        }

        if (!senhaValida) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        String accessToken = jwtService.gerarAccessToken(usuario);
        RefreshToken refreshToken = refreshTokenService.criarRefreshToken(usuario);

        return new UsuarioLoginResponse(accessToken, refreshToken.getToken(), usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil());
    }

    public UsuarioLoginResponse refresh(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenService.obterRefreshToken(refreshTokenStr)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido"));

        if (!refreshTokenService.validarRefreshToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expirado ou revogado");
        }

        Usuario usuario = refreshToken.getUsuario();
        String newAccessToken = jwtService.gerarAccessToken(usuario);

        return new UsuarioLoginResponse(newAccessToken, refreshTokenStr, usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil());
    }

    public void logout(String refreshTokenStr) {
        if (refreshTokenStr != null && !refreshTokenStr.isBlank()) {
            refreshTokenService.obterRefreshToken(refreshTokenStr)
                    .ifPresent(refreshTokenService::revogarRefreshToken);
        }
    }

    public Usuario usuarioAutenticado(String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        Long usuarioId;

        try {
            usuarioId = jwtService.extrairUsuarioId(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido ou expirado");
        }

        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário do token não encontrado"));
    }

    public void exigirAdministrador(String authorizationHeader) {
        Usuario usuario = usuarioAutenticado(authorizationHeader);
        if (usuario.getPerfil() != PerfilUsuario.ADMINISTRADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas administradores podem gerenciar usuários");
        }
    }

    public Usuario criarUsuario(UsuarioRequest request) {
        String nome = safeTrim(request.getNome());
        String email = normalize(request.getEmail());
        String senha = safeTrim(request.getSenha());
        PerfilUsuario perfil = request.getPerfil();

        if (nome.isBlank() || email.isBlank() || senha.isBlank() || perfil == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome, e-mail, senha e perfil são obrigatórios");
        }

        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senha));
        usuario.setPerfil(perfil);

        return usuarioRepository.save(usuario);
    }

    public Usuario atualizarUsuario(Usuario existente, UsuarioRequest request) {
        String nome = safeTrim(request.getNome());
        String email = normalize(request.getEmail());
        String senha = safeTrim(request.getSenha());
        PerfilUsuario perfil = request.getPerfil();

        if (nome.isBlank() || email.isBlank() || perfil == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome, e-mail e perfil são obrigatórios");
        }

        usuarioRepository.findByEmail(email)
                .filter(u -> !u.getId().equals(existente.getId()))
                .ifPresent(u -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
                });

        existente.setNome(nome);
        existente.setEmail(email);
        existente.setPerfil(perfil);

        if (!senha.isBlank()) {
            existente.setSenha(passwordEncoder.encode(senha));
        }

        return usuarioRepository.save(existente);
    }

    public String encodeSenha(String senha) {
        return passwordEncoder.encode(safeTrim(senha));
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank() || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token de autenticação ausente");
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length()).trim();
        if (token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token de autenticação inválido");
        }

        return token;
    }

    private String normalize(String value) {
        return safeTrim(value).toLowerCase();
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }
}
