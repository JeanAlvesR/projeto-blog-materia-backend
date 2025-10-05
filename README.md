# Sistema de Micro-blogging (Tipo Twitter)

Projeto de postagens de mensagens com arquitetura profissional em camadas, 3 coleções no MongoDB e sistema de logs.

## 🏗️ Arquitetura

```
Backend/
├── src/
│   ├── config/              # Configurações
│   │   ├── database.js
│   │   └── server.js
│   ├── database/            # Conexão com banco
│   │   └── Database.js
│   ├── models/              # Modelos de domínio (3 entidades)
│   │   ├── Usuario.js
│   │   ├── Postagem.js
│   │   └── Comentario.js
│   ├── services/            # Lógica de negócio
│   │   ├── UsuarioService.js
│   │   ├── PostagemService.js
│   │   └── ComentarioService.js
│   ├── controllers/         # Controladores
│   │   ├── UsuarioController.js
│   │   ├── PostagemController.js
│   │   └── ComentarioController.js
│   ├── routes/              # Roteamento HTTP
│   │   └── Router.js
│   ├── server/              # Servidor HTTP
│   │   └── Server.js
│   └── utils/               # Utilitários
│       └── Logger.js        # Sistema de logs
├── logs/                    # Arquivos de log
├── index.js
└── package.json
```

## 📦 3 Coleções MongoDB

### 1. usuarios
Gerencia os usuários do sistema.

**Campos obrigatórios:**
- `nome` (mínimo 3 caracteres)
- `email` (formato válido, único)
- `senha` (mínimo 6 caracteres)

**Campos automáticos:**
- `dataCriacao`
- `ativo`

### 2. postagens  
Postagens feitas pelos usuários.

**Campos obrigatórios:**
- `usuarioId` (referência ao usuário)
- `conteudo` (máximo 280 caracteres)

**Campos automáticos:**
- `data`
- `likes`

### 3. comentarios
Comentários nas postagens.

**Campos obrigatórios:**
- `postagemId` (referência à postagem)
- `usuarioId` (referência ao usuário)
- `conteudo` (máximo 280 caracteres)

**Campos automáticos:**
- `data`

## ✅ Requisitos Implementados

- ✅ **3 coleções no banco de dados**
- ✅ **Verificação de campos obrigatórios** em todos os models
- ✅ **Tratamento de exceções** em todas as camadas
- ✅ **Sistema de logs** para exceções capturadas (pasta logs/)
- ✅ **Validações de dados** (email, tamanho de strings, etc)
- ✅ **Relacionamentos** entre coleções (joins com aggregate)

## 📝 Sistema de Logs

Todos os erros e eventos importantes são registrados em arquivos de log na pasta `logs/`:

- Formato: `YYYY-MM-DD.log`
- Registra: timestamp, nível (INFO/ERROR), mensagem, stack trace
- Exemplos: criação de usuários, postagens, erros de validação, etc.

## 🚀 Funcionalidades

### Usuários
- Criar usuário
- Listar todos os usuários
- Buscar usuário por ID ou email
- Deletar usuário

### Postagens
- Criar postagem (vinculada a usuário)
- Listar todas com dados do autor
- Buscar por palavra-chave
- Dar likes
- Atualizar conteúdo
- Deletar postagem

### Comentários
- Comentar em postagens
- Listar comentários de uma postagem
- Deletar comentários

## 📋 Pré-requisitos

- Node.js instalado
- MongoDB rodando localmente na porta 27017

## 🔧 Instalação

```bash
npm install
```

## ▶️ Como Executar

```bash
npm start
```

O servidor será iniciado em: **http://localhost:3000**

## 📡 API - Rotas Completas

### USUÁRIOS

#### Criar usuário
```bash
POST /usuarios
Content-Type: application/json

{
  "nome": "Jean Alves",
  "email": "jean@example.com",
  "senha": "senha123"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome": "Jean Alves", "email": "jean@example.com", "senha": "senha123"}'
```

#### Listar todos os usuários
```bash
GET /usuarios
```

#### Buscar usuário por ID
```bash
GET /usuarios/:id
```

#### Buscar usuário por email
```bash
GET /usuarios/email/:email
```

#### Deletar usuário
```bash
DELETE /usuarios/:id
```

### POSTAGENS

#### Criar postagem
```bash
POST /postagens
Content-Type: application/json

{
  "usuarioId": "ID_DO_USUARIO",
  "conteudo": "Minha primeira postagem!"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/postagens \
  -H "Content-Type: application/json" \
  -d '{"usuarioId": "68e235e7233ad5376e1f47b1", "conteudo": "Olá mundo!"}'
```

#### Listar todas as postagens
```bash
GET /postagens
```

Retorna postagens com dados do autor (join com usuarios).

#### Buscar postagens por termo
```bash
GET /postagens/buscar?termo=javascript
```

#### Buscar postagem por ID
```bash
GET /postagens/:id
```

#### Atualizar postagem
```bash
PUT /postagens/:id
Content-Type: application/json

{
  "conteudo": "Novo conteúdo"
}
```

#### Dar like
```bash
POST /postagens/:id/like
```

#### Deletar postagem
```bash
DELETE /postagens/:id
```

Deleta a postagem e todos os comentários associados.

### COMENTÁRIOS

#### Criar comentário
```bash
POST /comentarios
Content-Type: application/json

{
  "postagemId": "ID_DA_POSTAGEM",
  "usuarioId": "ID_DO_USUARIO",
  "conteudo": "Ótima postagem!"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/comentarios \
  -H "Content-Type: application/json" \
  -d '{"postagemId": "68e235e7233ad5376e1f47b1", "usuarioId": "68e236d775d44a57f9080bf1", "conteudo": "Concordo!"}'
```

#### Listar comentários de uma postagem
```bash
GET /postagens/:id/comentarios
```

Retorna comentários com dados do autor.

#### Deletar comentário
```bash
DELETE /comentarios/:id
```

## 🧪 Fluxo de Teste Completo

```bash
# 1. Criar usuário
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome": "Jean Alves", "email": "jean@example.com", "senha": "senha123"}'

# Guarde o _id retornado como USUARIO_ID

# 2. Criar postagem
curl -X POST http://localhost:3000/postagens \
  -H "Content-Type: application/json" \
  -d '{"usuarioId": "USUARIO_ID", "conteudo": "Aprendendo Node.js com MongoDB!"}'

# Guarde o _id retornado como POSTAGEM_ID

# 3. Comentar na postagem
curl -X POST http://localhost:3000/comentarios \
  -H "Content-Type: application/json" \
  -d '{"postagemId": "POSTAGEM_ID", "usuarioId": "USUARIO_ID", "conteudo": "Ótimo conteúdo!"}'

# 4. Ver comentários da postagem
curl http://localhost:3000/postagens/POSTAGEM_ID/comentarios

# 5. Dar like na postagem
curl -X POST http://localhost:3000/postagens/POSTAGEM_ID/like

# 6. Listar todas as postagens
curl http://localhost:3000/postagens

# 7. Buscar postagens
curl "http://localhost:3000/postagens/buscar?termo=Node"
```

## 📊 Estruturas de Dados

### Usuario
```json
{
  "_id": "ObjectId",
  "nome": "Jean Alves",
  "email": "jean@example.com",
  "dataCriacao": "2025-10-05T...",
  "ativo": true
}
```

### Postagem
```json
{
  "_id": "ObjectId",
  "usuarioId": "ObjectId (ref: usuarios)",
  "conteudo": "Texto da postagem",
  "data": "2025-10-05T...",
  "likes": 5
}
```

### Comentario
```json
{
  "_id": "ObjectId",
  "postagemId": "ObjectId (ref: postagens)",
  "usuarioId": "ObjectId (ref: usuarios)",
  "conteudo": "Texto do comentário",
  "data": "2025-10-05T..."
}
```

## 🛡️ Validações Implementadas

### Campos Obrigatórios
- Todos os models validam campos obrigatórios
- Retorna erro 400 se faltar algum campo

### Validações Específicas
- **Usuario**: nome mínimo 3 chars, email válido, senha mínima 6 chars
- **Postagem**: conteúdo máximo 280 chars
- **Comentario**: conteúdo máximo 280 chars

### Validações de Relacionamento
- Verifica se usuário existe antes de criar postagem
- Verifica se postagem e usuário existem antes de criar comentário
- Email único para usuários

## 📄 Logs

Os logs são salvos em `logs/YYYY-MM-DD.log` com o formato:

```
[2025-10-05T10:00:00.000Z] [INFO] Usuário criado: jean@example.com
[2025-10-05T10:01:00.000Z] [ERROR] Erro ao criar postagem
Error: Usuário não encontrado
Stack: ...
```

## 🗄️ Banco de Dados

- **Banco:** exemplo01
- **Coleções:** usuarios, postagens, comentarios
- **Relacionamentos:** Uso de aggregate com $lookup para joins

## 🎯 Critérios de Avaliação Atendidos

✅ Implementação dos casos de uso da temática selecionada  
✅ Verificação de preenchimento de campos obrigatórios  
✅ Tratamento de exceções lançadas pelas bibliotecas  
✅ Armazenamento de arquivos de log com as exceções capturadas  
✅ Pelo menos 3 classes de armazenamento (coleções)  

## 📚 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **http** - Módulo nativo para servidor HTTP
- **mongodb** - Driver oficial do MongoDB
- **fs** - Sistema de arquivos para logs

## 👨‍💻 Autor

Jean Alves Rocha