package com.zoo.demo.estoque;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.zoo.demo.usuario.Usuario;
import com.zoo.demo.usuario.UsuarioAuthService;

@RestController
@RequestMapping("/api/estoque/anotacoes")
public class EstoqueAnotacaoController {

    private final EstoqueAnotacaoRepository repository;
    private final UsuarioAuthService usuarioAuthService;

    public EstoqueAnotacaoController(EstoqueAnotacaoRepository repository, UsuarioAuthService usuarioAuthService) {
        this.repository = repository;
        this.usuarioAuthService = usuarioAuthService;
    }

    @GetMapping
    public List<EstoqueAnotacao> all(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        if (data != null) {
            return repository.findAllByDataAnotacaoOrderByDataCriacaoDesc(data);
        }

        return repository.findAllByOrderByDataAnotacaoDescDataCriacaoDesc();
    }

    @PostMapping
    public ResponseEntity<EstoqueAnotacao> create(
            @RequestBody EstoqueAnotacaoRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @CookieValue(value = "accessToken", required = false) String accessTokenCookie) {

        String texto = request.getTexto() == null ? "" : request.getTexto();
        if (texto.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A anotação não pode ser vazia");
        }

        String tokenHeader = authorizationHeader;
        if ((tokenHeader == null || tokenHeader.isBlank()) && accessTokenCookie != null && !accessTokenCookie.isBlank()) {
            tokenHeader = "Bearer " + accessTokenCookie;
        }

        Usuario usuario = usuarioAuthService.usuarioAutenticado(tokenHeader);

        EstoqueAnotacao anotacao = new EstoqueAnotacao();
        anotacao.setDataAnotacao(request.getDataAnotacao() == null ? LocalDate.now() : request.getDataAnotacao());
        anotacao.setTexto(texto);
        anotacao.setAutorNome(usuario.getNome());
        anotacao.setDataCriacao(LocalDateTime.now());

        EstoqueAnotacao saved = repository.save(anotacao);
        return ResponseEntity.created(URI.create("/api/estoque/anotacoes/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstoqueAnotacao> update(@PathVariable Long id, @RequestBody EstoqueAnotacaoRequest request) {
        String texto = request.getTexto() == null ? "" : request.getTexto();
        if (texto.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A anotação não pode ser vazia");
        }

        return repository.findById(id)
                .map(existing -> {
                    existing.setTexto(texto);
                    EstoqueAnotacao updated = repository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repository.findById(id)
                .map(existing -> {
                    repository.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
