package com.zoo.demo.estoque;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EstoqueItemService {

    private final EstoqueItemRepository estoqueItemRepository;

    public EstoqueItemService(EstoqueItemRepository estoqueItemRepository) {
        this.estoqueItemRepository = estoqueItemRepository;
    }

    public List<EstoqueItem> listar(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return estoqueItemRepository.findAllByOrderByDataEntradaDescIdDesc();
        }

        String tipoNormalizado = normalizarTipo(tipo);
        return estoqueItemRepository.findByTipoOrderByDataEntradaDescIdDesc(tipoNormalizado);
    }

    public EstoqueItem criar(EstoqueItemRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Requisição inválida");
        }

        String nome = request.getNome() != null ? request.getNome().trim() : "";
        if (nome.isEmpty()) {
            throw new IllegalArgumentException("Nome do item é obrigatório");
        }

        if (request.getQuantidade() == null || request.getQuantidade().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }

        String tipo = normalizarTipo(request.getTipo());

        EstoqueItem item = new EstoqueItem();
        item.setTipo(tipo);
        item.setNome(nome);
        item.setQuantidade(request.getQuantidade());
        item.setUnidade(definirUnidade(tipo, request.getUnidade()));
        item.setDataEntrada(request.getDataEntrada() != null ? request.getDataEntrada() : LocalDate.now());
        item.setObservacao(normalizarTextoOpcional(request.getObservacao()));

        return estoqueItemRepository.save(item);
    }

    public void deletar(Long id) {
        estoqueItemRepository.deleteById(id);
    }

    private String normalizarTipo(String tipo) {
        String valor = tipo != null ? tipo.trim().toUpperCase() : "";
        if (!"ALIMENTO".equals(valor) && !"MATERIAL".equals(valor)) {
            throw new IllegalArgumentException("Tipo inválido. Use ALIMENTO ou MATERIAL");
        }
        return valor;
    }

    private String definirUnidade(String tipo, String unidadeInformada) {
        if ("ALIMENTO".equals(tipo)) {
            return "kg";
        }

        String unidade = unidadeInformada != null ? unidadeInformada.trim() : "";
        return unidade.isEmpty() ? "un" : unidade;
    }

    private String normalizarTextoOpcional(String texto) {
        if (texto == null) {
            return null;
        }

        String valor = texto.trim();
        return valor.isEmpty() ? null : valor;
    }
}
