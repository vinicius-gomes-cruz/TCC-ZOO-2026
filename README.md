# 🐾 Sistema de Gerenciamento de Zoológico

Sistema acadêmico para gerenciamento interno do zoológico de cascavel, com controle de **animais**, **habitats** e **estoque**.  
Desenvolvido seguindo o **C4 Model** para arquitetura, garantindo separação de responsabilidades e documentação clara dos containers e componentes.

---

## 🚀 Tecnologias Utilizadas

- **Backend:** Spring Boot, Spring Data JPA, Hibernate  
- **Banco de Dados:** MySQL  
- **Autenticação:** JWT (JSON Web Tokens)  
- **Documentação da API:** Swagger  
- **Frontend:** HTML, CSS, JavaScript  

---

## 👥 Usuários do Sistema

- **Funcionário**: gerencia animais, habitats e estoque.  
- **Administrador**: gerencia usuários, configurações do sistema e acessa a documentação da API.

---

## 🏗 Arquitetura – C4 Model

O projeto segue o **C4 Model**, com ênfase nos níveis:

- **C1 – System Context:** mostra os usuários e o sistema como caixa preta  
- **C2 – Container Diagram:** mostra a divisão do sistema em containers executáveis  
- **C3 – Component Diagram:** detalha a estrutura interna da API Spring Boot

---

### C2 – Containers

#### 1️⃣ Aplicação Web
- **Tecnologia:** HTML, CSS, JavaScript  
- **Responsabilidade:** Interface para interação dos usuários  
- **Comunicação:** Consome a API via HTTP/JSON

#### 2️⃣ API Backend
- **Tecnologia:** Spring Boot + Spring Data JPA + Hibernate + JWT + Swagger  
- **Responsabilidade:**  
  - Processar regras de negócio (Animais, Habitats, Estoque)  
  - Autenticação e autorização com JWT  
  - Disponibilizar documentação da API via Swagger  
- **Comunicação:** Recebe requisições da Aplicação Web e persiste dados no MySQL

#### 3️⃣ Banco de Dados
- **Tecnologia:** MySQL  
- **Responsabilidade:** Armazenar dados de animais, habitats, estoque e usuários  
- **Comunicação:** Recebe operações de persistência da API via JPA/Hibernate

---

### C3 – Componentes da API (Spring Boot)
com.zoologico
├── controller
│ ├── AnimalController
│ ├── HabitatController
│ └── EstoqueController
│
├── service
│ ├── AnimalService
│ ├── HabitatService
│ └── EstoqueService
│
├── repository
│ ├── AnimalRepository
│ ├── HabitatRepository
│ └── EstoqueRepository
│
├── model
│ ├── Animal
│ ├── Habitat
│ └── ItemEstoque
│
└── config
└── SecurityConfig (JWT)


