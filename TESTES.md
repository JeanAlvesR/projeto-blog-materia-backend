# Guia de Testes - Sistema de Micro-blogging

## 🔐 IMPORTANTE: Sistema de Autenticação

Este projeto utiliza **Express.js** com **sessões** para autenticação. Algumas rotas são **públicas** e outras exigem **autenticação**.

### Rotas Públicas (não precisam de login):
- `POST /usuarios` - Criar usuário
- `GET /postagens` - Listar postagens
- `GET /postagens/buscar` - Buscar postagens
- `GET /postagens/:id` - Ver postagem específica
- `GET /postagens/:id/comentarios` - Listar comentários

### Rotas Protegidas (precisam de login):
- `GET /usuarios` - Listar usuários
- `GET /usuarios/:id` - Buscar usuário
- `DELETE /usuarios/:id` - Deletar usuário
- `POST /postagens` - Criar postagem
- `PUT /postagens/:id` - Atualizar postagem
- `POST /postagens/:id/like` - Dar like
- `DELETE /postagens/:id` - Deletar postagem
- `POST /comentarios` - Criar comentário
- `DELETE /comentarios/:id` - Deletar comentário

## 🔑 Endpoints de Autenticação

### 1. Fazer Login

Antes de acessar rotas protegidas, você precisa fazer login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "senha": "senha123"
  }' \
  -c cookies.txt
```

**Resposta esperada:**
```json
{
  "mensagem": "Login realizado com sucesso!",
  "usuario": {
    "_id": "68e2381231d05b4edadf858f",
    "nome": "Jean Alves",
    "email": "jean@example.com"
  }
}
```

**IMPORTANTE:** A flag `-c cookies.txt` salva os cookies de sessão em um arquivo. Use `-b cookies.txt` nas próximas requisições para manter a autenticação.

### 2. Verificar Sessão

```bash
curl -X GET http://localhost:3000/auth/sessao -b cookies.txt
```

**Resposta esperada:**
```json
{
  "autenticado": true,
  "usuario": {
    "_id": "68e2381231d05b4edadf858f",
    "nome": "Jean Alves",
    "email": "jean@example.com"
  }
}
```

### 3. Fazer Logout

```bash
curl -X POST http://localhost:3000/auth/logout -b cookies.txt
```

**Resposta esperada:**
```json
{
  "mensagem": "Logout realizado com sucesso!"
}
```

### 4. Testando Proteção de Rotas

Tente acessar uma rota protegida SEM estar autenticado:

```bash
curl -X GET http://localhost:3000/usuarios
```

**Resposta esperada (401 Unauthorized):**
```json
{
  "erro": "Acesso negado. Você precisa estar autenticado para acessar este recurso."
}
```

Agora acesse a mesma rota COM autenticação:

```bash
curl -X GET http://localhost:3000/usuarios -b cookies.txt
```

**Resposta esperada (200 OK):**
```json
{
  "total": 1,
  "usuarios": [...]
}
```

## Testando as 3 Coleções

### 1. CRIAR USUÁRIO (Collection: usuarios)

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Jean Alves",
    "email": "jean@example.com",
    "senha": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "mensagem": "Usuário criado com sucesso!",
  "usuario": {
    "_id": "68e2381231d05b4edadf858f",
    "nome": "Jean Alves",
    "email": "jean@example.com",
    "dataCriacao": "2025-10-05T09:19:14.379Z",
    "ativo": true
  }
}
```

**Guarde o _id retornado como USUARIO_ID**

### 2. FAZER LOGIN

Antes de criar postagens, faça login com o usuário criado:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "senha": "senha123"
  }' \
  -c cookies.txt
```

### 3. CRIAR POSTAGEM (Collection: postagens) - 🔒 Autenticado

```bash
curl -X POST http://localhost:3000/postagens \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "USUARIO_ID",
    "conteudo": "Sistema com 3 coleções: usuarios, postagens e comentarios!"
  }' \
  -b cookies.txt
```

**Resposta esperada:**
```json
{
  "mensagem": "Postagem publicada com sucesso!",
  "postagem": {
    "_id": "68e2381a31d05b4edadf8590",
    "usuarioId": "68e2381231d05b4edadf858f",
    "conteudo": "Sistema com 3 coleções...",
    "data": "2025-10-05T09:19:22.359Z",
    "likes": 0
  }
}
```

**Guarde o _id retornado como POSTAGEM_ID**

### 4. CRIAR COMENTÁRIO (Collection: comentarios) - 🔒 Autenticado

```bash
curl -X POST http://localhost:3000/comentarios \
  -H "Content-Type: application/json" \
  -d '{
    "postagemId": "POSTAGEM_ID",
    "usuarioId": "USUARIO_ID",
    "conteudo": "Excelente implementação!"
  }' \
  -b cookies.txt
```

**Resposta esperada:**
```json
{
  "mensagem": "Comentário criado com sucesso!",
  "comentario": {
    "_id": "68e2382231d05b4edadf8591",
    "postagemId": "68e2381a31d05b4edadf8590",
    "usuarioId": "68e2381231d05b4edadf858f",
    "conteudo": "Excelente implementação!",
    "data": "2025-10-05T09:19:30.636Z"
  }
}
```

## Testando Relacionamentos (Joins)

### Listar Postagens com Dados do Autor

```bash
curl http://localhost:3000/postagens
```

**Mostra postagens com join de usuarios:**
```json
{
  "total": 1,
  "postagens": [
    {
      "_id": "...",
      "conteudo": "...",
      "data": "...",
      "likes": 0,
      "usuario": {
        "nome": "Jean Alves",
        "email": "jean@example.com"
      }
    }
  ]
}
```

### Listar Comentários com Dados do Autor

```bash
curl http://localhost:3000/postagens/POSTAGEM_ID/comentarios
```

**Mostra comentários com join de usuarios:**
```json
{
  "total": 1,
  "comentarios": [
    {
      "_id": "...",
      "conteudo": "...",
      "data": "...",
      "usuario": {
        "nome": "Jean Alves",
        "email": "jean@example.com"
      }
    }
  ]
}
```

## Testando Validações

### Campos Obrigatórios

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome": "Jo"}'
```

**Resposta esperada (400 Bad Request):**
```json
{
  "erro": "Campos \"nome\", \"email\" e \"senha\" são obrigatórios"
}
```

### Email Inválido

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste",
    "email": "email-invalido",
    "senha": "senha123"
  }'
```

**Resposta esperada (400):**
```json
{
  "erro": "Email inválido"
}
```

### Conteúdo muito longo

```bash
curl -X POST http://localhost:3000/postagens \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "USUARIO_ID",
    "conteudo": "'$(python3 -c 'print("a"*281)')'"
  }'
```

**Resposta esperada (400):**
```json
{
  "erro": "O conteúdo não pode ter mais de 280 caracteres"
}
```

### Usuário Não Encontrado

```bash
curl -X POST http://localhost:3000/postagens \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "507f1f77bcf86cd799439011",
    "conteudo": "Teste"
  }'
```

**Resposta esperada (404):**
```json
{
  "erro": "Usuário não encontrado"
}
```

## Testando Sistema de Logs

Após executar os comandos acima, verifique os logs:

```bash
cat logs/$(date +%Y-%m-%d).log
```

**Exemplo de log esperado:**
```
[2025-10-05T09:18:55.411Z] [INFO] Servidor iniciado com sucesso
[2025-10-05T09:19:14.397Z] [INFO] Usuário criado: jean@example.com
[2025-10-05T09:19:22.362Z] [INFO] Postagem criada pelo usuário: 68e2381231d05b4edadf858f
[2025-10-05T09:19:30.655Z] [INFO] Comentário criado na postagem: 68e2381a31d05b4edadf8590
[2025-10-05T09:20:24.888Z] [ERROR] Erro na rota POST /usuarios
Error: Campos "nome", "email" e "senha" são obrigatórios
Stack: ...
```

## Testando Funcionalidades Extras

### Dar Like em Postagem - 🔒 Autenticado

```bash
curl -X POST http://localhost:3000/postagens/POSTAGEM_ID/like -b cookies.txt
```

### Atualizar Postagem - 🔒 Autenticado

```bash
curl -X PUT http://localhost:3000/postagens/POSTAGEM_ID \
  -H "Content-Type: application/json" \
  -d '{"conteudo": "Conteúdo atualizado!"}' \
  -b cookies.txt
```

### Buscar Postagens por Termo

```bash
curl "http://localhost:3000/postagens/buscar?termo=coleções"
```

### Buscar Usuário por Email - 🔒 Autenticado

```bash
curl http://localhost:3000/usuarios/email/jean@example.com -b cookies.txt
```

## Fluxo Completo de Teste

Execute em sequência para testar tudo (incluindo autenticação):

```bash
# 1. Criar usuário (público)
USUARIO_ID=$(curl -s -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome": "Jean Alves", "email": "jean@example.com", "senha": "senha123"}' \
  | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)

echo "✓ Usuário criado: $USUARIO_ID"

# 2. Fazer login (salva sessão em cookies.txt)
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jean@example.com", "senha": "senha123"}' \
  -c cookies.txt > /dev/null

echo "✓ Login realizado com sucesso"

# 3. Verificar sessão
curl -s http://localhost:3000/auth/sessao -b cookies.txt
echo ""

# 4. Criar postagem (autenticado)
POSTAGEM_ID=$(curl -s -X POST http://localhost:3000/postagens \
  -H "Content-Type: application/json" \
  -d "{\"usuarioId\": \"$USUARIO_ID\", \"conteudo\": \"Teste completo com autenticacao!\"}" \
  -b cookies.txt \
  | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)

echo "✓ Postagem criada: $POSTAGEM_ID"

# 5. Dar like (autenticado)
curl -s -X POST http://localhost:3000/postagens/$POSTAGEM_ID/like -b cookies.txt > /dev/null
echo "✓ Like adicionado"

# 6. Criar comentário (autenticado)
curl -s -X POST http://localhost:3000/comentarios \
  -H "Content-Type: application/json" \
  -d "{\"postagemId\": \"$POSTAGEM_ID\", \"usuarioId\": \"$USUARIO_ID\", \"conteudo\": \"Ótimo!\"}" \
  -b cookies.txt > /dev/null

echo "✓ Comentário criado"

# 7. Listar postagens com join (público)
echo -e "\n📋 Listando postagens com join:"
curl -s http://localhost:3000/postagens | json_pp

# 8. Listar comentários com join (público)
echo -e "\n💬 Listando comentários com join:"
curl -s http://localhost:3000/postagens/$POSTAGEM_ID/comentarios | json_pp

# 9. Listar usuários (autenticado)
echo -e "\n👥 Listando usuários (rota protegida):"
curl -s http://localhost:3000/usuarios -b cookies.txt | json_pp

# 10. Fazer logout
echo -e "\n🚪 Fazendo logout:"
curl -s -X POST http://localhost:3000/auth/logout -b cookies.txt

# 11. Tentar acessar rota protegida após logout (deve falhar)
echo -e "\n❌ Tentando acessar rota protegida após logout:"
curl -s http://localhost:3000/usuarios -b cookies.txt

# 12. Verificar logs
echo -e "\n\n📝 Verificando logs:"
tail -20 logs/$(date +%Y-%m-%d).log
```

## 📊 Resumo do Projeto

### ✅ Requisitos Atendidos

1. **Express.js** - ✅ Implementado
   - Servidor usando Express ao invés de HTTP nativo
   - Middlewares configurados (body-parser, sessions)

2. **Sistema de Autenticação** - ✅ Implementado
   - Login/Logout funcionando
   - Sessões usando `express-session`
   - Middleware de proteção de rotas
   - Cookies de sessão com 24h de duração

3. **Rotas Públicas e Protegidas** - ✅ Implementado
   - Rotas públicas: criar usuário, listar/buscar postagens, ver comentários
   - Rotas protegidas: criar/atualizar/deletar postagens, criar comentários, gerenciar usuários

4. **Validações** - ✅ Implementado
   - Campos obrigatórios verificados
   - Mensagens de erro adequadas
   - Validação de email, tamanho de senha, tamanho de conteúdo

5. **Casos de Uso** - ✅ Implementado
   - CRUD completo de usuários, postagens e comentários
   - Sistema de likes
   - Busca de postagens
   - Relacionamentos entre coleções (joins)

### 🔧 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web (requisito obrigatório)
- **express-session** - Gerenciamento de sessões (requisito obrigatório)
- **MongoDB** - Banco de dados NoSQL
- **MongoDB Aggregation Pipeline** - Joins entre coleções

### 📁 Arquivos Criados/Modificados

- `src/Server.js` - Migrado de HTTP nativo para Express
- `src/AuthController.js` - Controller de autenticação (novo)
- `src/AuthMiddleware.js` - Middleware de proteção de rotas (novo)
- `src/UsuarioController.js` - Adaptado para Express
- `src/PostagemController.js` - Adaptado para Express
- `src/ComentarioController.js` - Adaptado para Express
- `TESTES.md` - Atualizado com endpoints de autenticação
```
