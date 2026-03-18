# Sistema de Gerenciamento de Zoológico – C2 (Container Diagram)

## Pessoas
- **Funcionário**  
  - Acessa o sistema para gerenciar animais, habitats e estoque.

- **Administrador**  
  - Acessa o sistema para gerenciar usuários, configurações e documentação da API.

---

## Containers

### 1️⃣ Aplicação Web
- **Tecnologia:** React
- **Responsabilidade:** Fornece interface para os usuários interagirem com o sistema.  
- **Comunicação:** Realiza chamadas HTTP/JSON para a API Backend.  

### 2️⃣ API Backend
- **Tecnologia:** Spring Boot, Spring Data JPA, Hibernate, JWT, Swagger  
- **Responsabilidade:**  
  - Processar regras de negócio (Animais, Habitats, Estoque)  
  - Gerenciar autenticação e autorização com JWT  
  - Disponibilizar documentação da API via Swagger  
- **Comunicação:**  
  - Recebe requisições da Aplicação Web  
  - Persiste dados no Banco de Dados MySQL  

### 3️⃣ Banco de Dados
- **Tecnologia:** MySQL  
- **Responsabilidade:**  
  - Armazenar dados de Animais, Habitats, Estoque e Usuários  
- **Comunicação:**  
  - Recebe operações de persistência da API Backend via JPA/Hibernate  

---

## Relacionamentos
- **Funcionário → Aplicação Web:** acessa interface para gerenciar operações do zoológico  
- **Administrador → Aplicação Web:** acessa interface e funções administrativas  
- **Administrador → API Backend:** acessa documentação da API via Swagger  
- **Aplicação Web → API Backend:** consome serviços REST/JSON  
- **API Backend → Banco de Dados:** persiste dados via JPA/Hibernate  

---