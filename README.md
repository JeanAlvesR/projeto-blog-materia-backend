# 📝 Sistema de Micro-blogging - Backend

Projeto de backend desenvolvido para a disciplina de Desenvolvimento Backend, implementando um sistema completo de micro-blogging (similar ao Twitter) com autenticação, sessões e validações.

## 📋 Requisitos Atendidos

Este projeto atende **todos** os requisitos obrigatórios da disciplina:

- ✅ **Express.js** - Framework web para Node.js
- ✅ **Sistema de Login** - Autenticação de usuários
- ✅ **Sessões** - Gerenciamento com `express-session`
- ✅ **Rotas GET/POST** - Recebimento de parâmetros
- ✅ **Validações** - Verificação de campos obrigatórios com mensagens de erro
- ✅ **API RESTful** - Retorno de dados em formato JSON
- ✅ **Casos de Uso** - CRUD completo para blog (usuários, postagens, comentários)

## 🏗️ Arquitetura

O projeto segue o padrão **Controller-Service-Model**:

```
src/
├── Server.js              # Configuração do Express e rotas
├── AuthController.js      # Controller de autenticação
├── AuthMiddleware.js      # Middleware de proteção de rotas
├── UsuarioController.js   # Controller + Service de usuários
├── PostagemController.js  # Controller + Service de postagens
├── ComentarioController.js # Controller + Service de comentários
├── Usuario.js             # Model de usuário
├── Postagem.js            # Model de postagem
├── Comentario.js          # Model de comentário
├── Database.js            # Conexão com MongoDB
└── Logger.js              # Sistema de logs
```

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js 5.1.0** - Framework web
- **express-session 1.18.2** - Gerenciamento de sessões
- **MongoDB 6.20.0** - Banco de dados NoSQL
- **MongoDB Aggregation Pipeline** - Joins entre coleções

## 📦 Instalação

### Pré-requisitos

- Node.js 14+
- MongoDB rodando localmente na porta 27017

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/JeanAlvesR/projeto-blog-materia-backend.git
cd projeto-blog-materia-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Certifique-se que o MongoDB está rodando:
```bash
# MongoDB deve estar rodando em mongodb://127.0.0.1:27017
```

4. Inicie o servidor:
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 🔐 Sistema de Autenticação

### Como funciona

O projeto utiliza **sessões** para autenticação:

1. Usuário faz login com email e senha
2. Servidor cria uma sessão e retorna cookie
3. Cookie deve ser enviado em requisições subsequentes
4. Middleware verifica autenticação nas rotas protegidas

### Endpoints de Autenticação

```
POST   /auth/login              - Fazer login
POST   /auth/logout             - Fazer logout
GET    /auth/sessao             - Verificar sessão ativa
```

### Exemplo de Login

```bash
# Fazer login e salvar cookies
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@exemplo.com","senha":"senha123"}' \
  -c cookies.txt

# Usar cookies nas próximas requisições
curl http://localhost:3000/usuarios -b cookies.txt
```

## 🛣️ Rotas da API

### 🌍 Rotas Públicas (não precisam autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Informações da API |
| `POST` | `/usuarios` | Criar novo usuário |
| `GET` | `/postagens` | Listar todas as postagens |
| `GET` | `/postagens/buscar?termo=xxx` | Buscar postagens por termo |
| `GET` | `/postagens/:id` | Buscar postagem por ID |
| `GET` | `/postagens/:id/comentarios` | Listar comentários de uma postagem |

### 🔒 Rotas Protegidas (precisam autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/usuarios` | Listar todos os usuários |
| `GET` | `/usuarios/:id` | Buscar usuário por ID |
| `GET` | `/usuarios/email/:email` | Buscar usuário por email |
| `DELETE` | `/usuarios/:id` | Deletar usuário |
| `POST` | `/postagens` | Criar nova postagem |
| `PUT` | `/postagens/:id` | Atualizar postagem |
| `POST` | `/postagens/:id/like` | Dar like em postagem |
| `DELETE` | `/postagens/:id` | Deletar postagem |
| `POST` | `/comentarios` | Criar comentário |
| `DELETE` | `/comentarios/:id` | Deletar comentário |

## 📝 Exemplos de Uso

### 1. Criar Usuário (Público)

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "senha": "senha123"
  }'
```

### 2. Fazer Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@exemplo.com","senha":"senha123"}' \
  -c cookies.txt
```

### 3. Criar Postagem (Autenticado)

```bash
curl -X POST http://localhost:3000/postagens \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "6917cfb4fbbe5b0c0902a71a",
    "conteudo": "Minha primeira postagem!"
  }' \
  -b cookies.txt
```

### 4. Dar Like (Autenticado)

```bash
curl -X POST http://localhost:3000/postagens/POSTAGEM_ID/like \
  -b cookies.txt
```

### 5. Criar Comentário (Autenticado)

```bash
curl -X POST http://localhost:3000/comentarios \
  -H "Content-Type: application/json" \
  -d '{
    "postagemId": "POSTAGEM_ID",
    "usuarioId": "USUARIO_ID",
    "conteudo": "Ótimo post!"
  }' \
  -b cookies.txt
```

## ✅ Validações Implementadas

### Usuário
- Nome: mínimo 3 caracteres (obrigatório)
- Email: formato válido e único (obrigatório)
- Senha: mínimo 6 caracteres (obrigatório)

### Postagem
- Conteúdo: máximo 280 caracteres (obrigatório)
- UsuarioId: deve existir no banco (obrigatório)

### Comentário
- Conteúdo: máximo 280 caracteres (obrigatório)
- PostagemId: deve existir no banco (obrigatório)
- UsuarioId: deve existir no banco (obrigatório)

## 🗃️ Banco de Dados

### Configuração
- Host: `127.0.0.1:27017`
- Database: `blog_db`
- Collections: `usuarios`, `postagens`, `comentarios`

### Estrutura das Collections

**usuarios**
```javascript
{
  _id: ObjectId,
  nome: String,
  email: String (unique),
  senha: String,
  dataCriacao: Date,
  ativo: Boolean
}
```

**postagens**
```javascript
{
  _id: ObjectId,
  usuarioId: ObjectId,
  conteudo: String,
  data: Date,
  likes: Number
}
```

**comentarios**
```javascript
{
  _id: ObjectId,
  postagemId: ObjectId,
  usuarioId: ObjectId,
  conteudo: String,
  data: Date
}
```

## 📊 Funcionalidades Especiais

### MongoDB Aggregation Pipeline
As listagens de postagens e comentários utilizam o **$lookup** do MongoDB para fazer joins e trazer informações do autor:

```javascript
// Exemplo: Listar postagens com dados do autor
{
  $lookup: {
    from: 'usuarios',
    localField: 'usuarioId',
    foreignField: '_id',
    as: 'usuario'
  }
}
```

### Sistema de Logs
Todos os eventos importantes são registrados em arquivos de log diários:

```bash
# Ver logs de hoje
cat logs/$(date +%Y-%m-%d).log
```

### Cascade Delete
Ao deletar uma postagem, todos os comentários associados são automaticamente deletados.

## 🧪 Testes

Consulte o arquivo [TESTES.md](./TESTES.md) para exemplos completos de teste, incluindo:

- Testes de autenticação
- Testes de validação
- Testes de proteção de rotas
- Script completo de teste automatizado

## 📁 Estrutura de Diretórios

```
projeto-blog-materia-backend/
├── src/                    # Código fonte
│   ├── Server.js          # Configuração Express
│   ├── Auth*.js           # Sistema de autenticação
│   ├── *Controller.js     # Controllers
│   ├── *.js               # Models
│   ├── Database.js        # Conexão MongoDB
│   └── Logger.js          # Sistema de logs
├── logs/                   # Logs diários
├── node_modules/           # Dependências
├── index.js               # Entry point
├── package.json           # Configurações NPM
├── TESTES.md              # Guia de testes
└── README.md              # Este arquivo
```

## 👨‍💻 Autor

**Jean Alves Rocha**

- GitHub: [@JeanAlvesR](https://github.com/JeanAlvesR)

## 📄 Licença

ISC

## 🎓 Projeto Acadêmico

Este projeto foi desenvolvido como trabalho avaliativo para a disciplina de Desenvolvimento Backend, atendendo todos os requisitos especificados pelo professor.

### Critérios de Avaliação Atendidos

- ✅ Implementação dos casos de uso da temática (blog)
- ✅ Verificação de preenchimento de campos obrigatórios
- ✅ Apresentação de mensagens de erro adequadas
- ✅ Rotina de login para identificar usuários
- ✅ Uso de sessões para garantir autenticidade
- ✅ Aplicação web desenvolvida com Express.js
- ✅ Recebimento de parâmetros via GET e POST
- ✅ Retorno de dados no formato JSON

---

**Nota:** Este projeto utiliza apenas bibliotecas aprovadas pelo professor (Express.js, express-session, MongoDB driver nativo).
