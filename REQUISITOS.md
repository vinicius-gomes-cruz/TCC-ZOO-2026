# Requisitos do Sistema - ZooGestor

## 1. Escopo
Sistema acadêmico para gerenciamento interno do zoológico, com foco em:
- Controle de habitats e animais
- Controle de biotério (roedores)
- Controle de estoque (alimentos e materiais)
- Apoio à ciência de dados para previsão de insumos

## 2. Requisitos Funcionais

### 2.1 Módulo Habitats e Animais
- RF01: O sistema deve cadastrar, editar, listar e excluir habitats.
- RF02: O sistema deve cadastrar, editar, listar e excluir animais vinculados a um habitat.
- RF03: O sistema deve manter dados zootécnicos e sanitários básicos do animal (identificação, espécie, saúde, tratamentos e alimentação).

### 2.2 Módulo Estoque
- RF04: O sistema deve cadastrar entradas de alimentação por animal, com nome do item, tipo, quantidade e data de chegada.
- RF05: O sistema deve registrar ciclo de uso da alimentação, incluindo data de abertura e data de término.
- RF06: O sistema deve permitir excluir registros de alimentação.
- RF07: O sistema deve controlar estoque de alimentos armazenados na cozinha.
- RF08: O sistema deve controlar estoque de materiais armazenados em sala específica.
- RF09: O sistema deve registrar local de armazenamento do item (cozinha ou sala) de forma obrigatória.
- RF10: O sistema deve registrar movimentações de estoque (entrada, saída e ajuste), com data, quantidade e motivo.
- RF11: O sistema deve permitir definir estoque mínimo por item e emitir alerta de reposição.
- RF12: O sistema deve gerar relatório de consumo por período, por espécie e por setor.

### 2.3 Módulo Biotério
- RF13: O sistema deve cadastrar, editar, listar e excluir caixas de biotério com número da caixa, grupo de fêmeas, idade das fêmeas, machos rotativos, crias e observações.
- RF14: O sistema deve registrar formação de casal por caixa, com data do evento e identificação dos indivíduos envolvidos.
- RF15: O sistema deve registrar nascimentos por caixa, incluindo data, quantidade de filhotes e identificação da ninhada.
- RF16: O sistema deve registrar desmame por ninhada, com data e quantidade desmamada.
- RF17: O sistema deve registrar ocorrências zootécnicas e sanitárias (morte no parto, eutanásia, canibalismo e outros eventos críticos).
- RF18: O sistema deve manter histórico cronológico por caixa e por indivíduo, garantindo rastreabilidade.
- RF19: O sistema deve permitir classificar animais do biotério por espécie (ratos, camundongos, porquinhos-da-índia etc.) e por grupo.

### 2.4 Módulo Usuários
- RF20: O sistema deve cadastrar, editar, listar e excluir usuários.
- RF21: O sistema deve permitir associação de perfil de acesso (funcionário e administrador).

### 2.5 Ciência de Dados para Previsão de Insumos
- RF22: O sistema deve consolidar histórico de consumo de alimentos e materiais para análise.
- RF23: O sistema deve gerar previsão de consumo de insumos para curto e médio prazo.
- RF24: O sistema deve sugerir ponto de reposição e quantidade recomendada de compra por item.
- RF25: O sistema deve exibir indicadores de acurácia da previsão.
- RF26: O sistema deve permitir recalibrar o modelo de previsão com novos dados históricos.

## 3. Requisitos Não Funcionais
- RNF01: Usabilidade: a interface deve permitir executar operações principais em até 3 cliques após seleção do módulo.
- RNF02: Desempenho: listagens e consultas devem responder em até 2 segundos para carga de uso acadêmica.
- RNF03: Disponibilidade: o sistema deve permanecer disponível durante o horário operacional do laboratório.
- RNF04: Integridade de dados: campos obrigatórios devem ser validados para impedir registros incompletos.
- RNF05: Consistência: número de caixa deve ser único.
- RNF06: Segurança: deve haver autenticação e autorização por perfil.
- RNF07: Privacidade: senhas não devem ser expostas em respostas e devem ser armazenadas com criptografia.
- RNF08: Auditabilidade: ações críticas devem ser registradas com data, hora e usuário.
- RNF09: Rastreabilidade: eventos de biotério e movimentações de estoque devem manter histórico imutável.
- RNF10: Escalabilidade: a arquitetura deve permitir inclusão de novos módulos sem reescrita do núcleo.
- RNF11: Interoperabilidade: API deve seguir padrão REST com JSON consistente.
- RNF12: Portabilidade: front-end deve funcionar em navegadores modernos em ambiente desktop.
- RNF13: Manutenibilidade: código deve manter separação por domínio e serviços para facilitar evolução.
- RNF14: Backup e recuperação: deve existir rotina de backup e procedimento de restauração testado.
- RNF15: Ciência de dados: o pipeline de previsão deve ser reprodutível, versionado e monitorado quanto a erro de previsão.

## 4. Observação de Aderência ao Sistema Atual
Alguns requisitos já estão parcialmente implementados no estado atual do projeto (cadastros principais e parte do estoque). Outros itens, principalmente eventos detalhados do biotério, separação formal de armazenagem por local e módulo preditivo de ciência de dados, representam evolução planejada do sistema.
