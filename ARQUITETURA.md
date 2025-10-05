# Arquitetura em Camadas

## 🏛️ Visão Geral

Este projeto utiliza arquitetura em camadas (Layered Architecture) para separação clara de responsabilidades.

```
┌─────────────────────────────────────┐
│           HTTP Request              │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Router Layer                │
│   (src/routes/Router.js)            │
│   - Roteamento HTTP                 │
│   - Parse de requisições            │
│   - Tratamento de erros HTTP        │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Controller Layer              │
│   (src/controllers/)                │
│   - Processa requisições            │
│   - Formata respostas               │
│   - Validações de entrada           │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│        Service Layer                │
│   (src/services/)                   │
│   - Lógica de negócio               │
│   - Regras de domínio               │
│   - Orquestração de operações       │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Model Layer                 │
│   (src/models/)                     │
│   - Entidades de domínio            │
│   - Validações de entidade          │
│   - Representação dos dados         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Database Layer                │
│   (src/database/)                   │
│   - Conexão com banco               │
│   - Operações de persistência       │
└─────────────────────────────────────┘
```

## 📁 Estrutura de Diretórios

```
src/
├── config/              Configurações estáticas
├── database/            Camada de acesso a dados
├── models/              Modelos de domínio
├── services/            Lógica de negócio
├── controllers/         Controladores de requisição
├── routes/              Roteamento HTTP
└── server/              Configuração do servidor
```

## 🔄 Fluxo de Dados

### Exemplo: Criar Postagem

1. **Router** recebe requisição POST /postagens
2. **Router** faz parse do body JSON
3. **Router** chama `PostagemController.criar(dados)`
4. **Controller** recebe dados e chama `PostagemService.criar(autor, conteudo)`
5. **Service** cria instância de `Postagem` (Model)
6. **Service** valida a postagem
7. **Service** persiste no banco via `Database.getCollection()`
8. **Service** retorna postagem criada
9. **Controller** formata resposta
10. **Router** envia resposta HTTP 201

## 📦 Responsabilidades por Camada

### Config Layer
**Arquivos:** `src/config/*.js`
- Configurações estáticas da aplicação
- Parâmetros de conexão
- Constantes do sistema

### Database Layer
**Arquivos:** `src/database/Database.js`
- Gerencia conexão com MongoDB
- Fornece acesso às collections
- Gerencia lifecycle da conexão

### Model Layer
**Arquivos:** `src/models/*.js`
- Define estrutura das entidades
- Validações de dados da entidade
- Métodos de serialização (toJSON)
- Regras de domínio da entidade

**Exemplo:**
```javascript
class Postagem {
    constructor(autor, conteudo) {
        this.autor = autor;
        this.conteudo = conteudo;
        this.data = new Date();
        this.likes = 0;
    }

    validar() {
        if (!this.autor || !this.conteudo) {
            throw new Error('Campos obrigatórios');
        }
        return true;
    }
}
```

### Service Layer
**Arquivos:** `src/services/*.js`
- Lógica de negócio complexa
- Operações CRUD
- Validações de regras de negócio
- Operações com o banco de dados

**Exemplo:**
```javascript
class PostagemService {
    async criar(autor, conteudo) {
        const postagem = new Postagem(autor, conteudo);
        postagem.validar();
        return await this.database
            .getCollection('postagens')
            .insertOne(postagem.toJSON());
    }
}
```

### Controller Layer
**Arquivos:** `src/controllers/*.js`
- Processa requisições HTTP
- Chama serviços apropriados
- Formata respostas para o cliente
- Não contém lógica de negócio

**Exemplo:**
```javascript
class PostagemController {
    async criar(dados) {
        const postagem = await this.service.criar(
            dados.autor, 
            dados.conteudo
        );
        return {
            mensagem: 'Sucesso!',
            postagem
        };
    }
}
```

### Router Layer
**Arquivos:** `src/routes/*.js`
- Define rotas HTTP
- Parse de URL e query strings
- Parse de body JSON
- Tratamento de erros HTTP
- Mapeamento de status codes

### Server Layer
**Arquivos:** `src/server/*.js`
- Inicializa servidor HTTP
- Configura dependências (DI)
- Gerencia lifecycle
- Graceful shutdown

## 🎯 Benefícios da Arquitetura

### 1. Separação de Responsabilidades
Cada camada tem uma responsabilidade única e bem definida.

### 2. Testabilidade
Camadas podem ser testadas isoladamente com mocks.

### 3. Manutenibilidade
Mudanças em uma camada não afetam outras.

### 4. Reutilização
Services podem ser usados por múltiplos controllers.

### 5. Escalabilidade
Fácil adicionar novas features seguindo o padrão.

## 🔧 Injeção de Dependências

O projeto usa injeção de dependências manual via construtor:

```javascript
const database = new Database(config);
const service = new PostagemService(database);
const controller = new PostagemController(service);
const router = new Router(controller);
```

Isso permite:
- Desacoplamento entre camadas
- Facilita testes unitários
- Inversão de controle

## 📚 Princípios SOLID Aplicados

### Single Responsibility (S)
Cada classe tem uma única responsabilidade.

### Open/Closed (O)
Aberto para extensão, fechado para modificação.

### Liskov Substitution (L)
Classes base podem ser substituídas por derivadas.

### Interface Segregation (I)
Interfaces específicas por cliente.

### Dependency Inversion (D)
Dependa de abstrações, não de implementações concretas.
