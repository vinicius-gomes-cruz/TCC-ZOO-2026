package com.zoo.demo.bioterio;

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
@RequestMapping("/api/bioterio/anotacoes")
public class BioterioAnotacaoController {

    private final BioterioAnotacaoRepository repository;
    private final UsuarioAuthService usuarioAuthService;

    public BioterioAnotacaoController(BioterioAnotacaoRepository repository, UsuarioAuthService usuarioAuthService) {
        this.repository = repository;
        this.usuarioAuthService = usuarioAuthService;
    }

    @GetMapping
    public List<BioterioAnotacao> all(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        if (data != null) {
            return repository.findAllByDataAnotacaoOrderByDataCriacaoDesc(data);
        }

        return repository.findAllByOrderByDataAnotacaoDescDataCriacaoDesc();
    }

    @PostMapping
    public ResponseEntity<BioterioAnotacao> create(
            @RequestBody BioterioAnotacaoRequest request,
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

        BioterioAnotacao anotacao = new BioterioAnotacao();
        anotacao.setDataAnotacao(request.getDataAnotacao() == null ? LocalDate.now() : request.getDataAnotacao());
        anotacao.setTexto(texto);
        anotacao.setAutorNome(usuario.getNome());
        anotacao.setDataCriacao(LocalDateTime.now());

        BioterioAnotacao saved = repository.save(anotacao);
        return ResponseEntity.created(URI.create("/api/bioterio/anotacoes/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BioterioAnotacao> update(@PathVariable Long id, @RequestBody BioterioAnotacaoRequest request) {
        String texto = request.getTexto() == null ? "" : request.getTexto();
        if (texto.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A anotação não pode ser vazia");
        }

        return repository.findById(id)
                .map(existing -> {
                    existing.setTexto(texto);
                    BioterioAnotacao updated = repository.save(existing);
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
