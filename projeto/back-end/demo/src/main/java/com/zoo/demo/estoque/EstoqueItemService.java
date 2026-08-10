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
        if ("RACAO".equals(tipoNormalizado)) {
            return estoqueItemRepository.findByTipoAndNoBioterioOrderByDataEntradaDescIdDesc("RACAO", false);
        }
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
        item.setUnidade(definirUnidade(tipo, request.getUnidade()));
        item.setDataEntrada(request.getDataEntrada() != null ? request.getDataEntrada() : LocalDate.now());
        item.setNoBioterio(false);

        if ("RACAO".equals(tipo)) {
            if (request.getPesoPorPacote() == null || request.getPesoPorPacote().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Peso por pacote é obrigatório para ração");
            }
            if (request.getQuantidadePacotes() == null || request.getQuantidadePacotes() <= 0) {
                throw new IllegalArgumentException("Quantidade de pacotes deve ser maior que zero");
            }
            item.setPesoPorPacote(request.getPesoPorPacote());
            item.setQuantidadePacotes(request.getQuantidadePacotes());
            item.setQuantidade(request.getPesoPorPacote().multiply(BigDecimal.valueOf(request.getQuantidadePacotes())));
        } else {
            item.setQuantidade(request.getQuantidade());
        }

        return estoqueItemRepository.save(item);
    }

    /** Adiciona pacotes a uma ração já existente */
    public EstoqueItem adicionarPacotes(Long id, int pacotes) {
        if (pacotes <= 0) {
            throw new IllegalArgumentException("Quantidade de pacotes deve ser maior que zero");
        }

        EstoqueItem item = estoqueItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado"));

        if (!"RACAO".equals(item.getTipo())) {
            throw new IllegalArgumentException("Apenas itens do tipo RACAO suportam adição de pacotes");
        }

        int novosTotal = (item.getQuantidadePacotes() != null ? item.getQuantidadePacotes() : 0) + pacotes;
        item.setQuantidadePacotes(novosTotal);
        item.setQuantidade(item.getPesoPorPacote().multiply(BigDecimal.valueOf(novosTotal)));

        return estoqueItemRepository.save(item);
    }

    public void deletar(Long id) {
        estoqueItemRepository.deleteById(id);
    }

    /** Lista rações disponíveis no estoque (não enviadas ao biotério) */
    public List<EstoqueItem> listarRacoesDisponiveis() {
        return estoqueItemRepository.findByTipoAndNoBioterioOrderByDataEntradaDescIdDesc("RACAO", false);
    }

    /** Lista rações que estão atualmente no biotério */
    public List<EstoqueItem> listarRacoesNoBioterio() {
        return estoqueItemRepository.findByTipoAndNoBioterioOrderByDataEntradaDescIdDesc("RACAO", true);
    }

    /** Envia uma quantidade de pacotes de uma ração para o biotério */
    public EstoqueItem enviarParaBioterio(Long id, int pacotes) {
        if (pacotes <= 0) {
            throw new IllegalArgumentException("Quantidade de pacotes deve ser maior que zero");
        }

        EstoqueItem item = estoqueItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado"));

        if (!"RACAO".equals(item.getTipo())) {
            throw new IllegalArgumentException("Apenas itens do tipo RACAO podem ser enviados ao biotério");
        }

        if (item.isNoBioterio()) {
            throw new IllegalArgumentException("Este item já está no biotério");
        }

        int pacotesDisponiveis = item.getQuantidadePacotes() != null ? item.getQuantidadePacotes() : 0;
        if (pacotes > pacotesDisponiveis) {
            throw new IllegalArgumentException("Pacotes insuficientes no estoque");
        }

        // Cria item no biotério
        EstoqueItem itemBioterio = new EstoqueItem();
        itemBioterio.setTipo(item.getTipo());
        itemBioterio.setNome(item.getNome());
        itemBioterio.setUnidade(item.getUnidade());
        itemBioterio.setPesoPorPacote(item.getPesoPorPacote());
        itemBioterio.setQuantidadePacotes(pacotes);
        itemBioterio.setQuantidade(item.getPesoPorPacote().multiply(BigDecimal.valueOf(pacotes)));
        itemBioterio.setDataEntrada(item.getDataEntrada());
        itemBioterio.setNoBioterio(true);
        estoqueItemRepository.save(itemBioterio);

        // Subtrai pacotes do item original
        int restante = pacotesDisponiveis - pacotes;
        item.setQuantidadePacotes(restante);
        item.setQuantidade(item.getPesoPorPacote().multiply(BigDecimal.valueOf(restante)));
        estoqueItemRepository.save(item);

        return itemBioterio;
    }

    /** Marca que a ração acabou no biotério — remove do estoque */
    public void finalizarNoBioterio(Long id) {
        EstoqueItem item = estoqueItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado"));

        if (!item.isNoBioterio()) {
            throw new IllegalArgumentException("Este item não está no biotério");
        }

        estoqueItemRepository.delete(item);
    }

    private String normalizarTipo(String tipo) {
        String valor = tipo != null ? tipo.trim().toUpperCase() : "";
        if (!"ALIMENTO".equals(valor) && !"MATERIAL".equals(valor) && !"RACAO".equals(valor)) {
            throw new IllegalArgumentException("Tipo inválido. Use ALIMENTO, MATERIAL ou RACAO");
        }
        return valor;
    }

    private String definirUnidade(String tipo, String unidadeInformada) {
        if ("ALIMENTO".equals(tipo) || "RACAO".equals(tipo)) {
            return "kg";
        }

        String unidade = unidadeInformada != null ? unidadeInformada.trim() : "";
        return unidade.isEmpty() ? "un" : unidade;
    }
}
