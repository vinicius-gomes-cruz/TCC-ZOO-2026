# 🐾 Sistema de Gerenciamento de Zoológico

Sistema acadêmico para gerenciamento interno de zoológicos, com controle de **animais**, **habitats** e **estoque**.  
Desenvolvido com **Spring Boot**, **MySQL**, **JPA/Hibernate**, **JWT** e documentação via **Swagger**.

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

## 🏗 Estrutura do Sistema (C2 – Container Diagram)

### Aplicação Web
- **Tecnologia:** HTML, CSS, JavaScript  
- **Responsabilidade:** Interface para interação dos usuários  
- **Comunicação:** Consome a API via HTTP/JSON

### API Backend
- **Tecnologia:** Spring Boot + Spring Data JPA + Hibernate + JWT + Swagger  
- **Responsabilidade:**  
  - Regras de negócio (Animais, Habitats, Estoque)  
  - Autenticação e autorização com JWT  
  - Documentação da API via Swagger  
- **Comunicação:** Recebe requisições da Aplicação Web e persiste dados no MySQL

### Banco de Dados
- **Tecnologia:** MySQL  
- **Responsabilidade:** Armazena dados de animais, habitats, estoque e usuários  
- **Comunicação:** Recebe operações de persistência da API via JPA/Hibernate

---

## 📦 Estrutura da API (Spring Boot – Pacotes)
