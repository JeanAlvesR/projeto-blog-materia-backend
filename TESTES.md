# Guia de Testes - Sistema de Micro-blogging

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

### 2. CRIAR POSTAGEM (Collection: postagens)

```bash
curl -X POST http://localhost:3000/postagens \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "USUARIO_ID",
    "conteudo": "Sistema com 3 coleções: usuarios, postagens e comentarios!"
  }'
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

### 3. CRIAR COMENTÁRIO (Collection: comentarios)

```bash
curl -X POST http://localhost:3000/comentarios \
  -H "Content-Type: application/json" \
  -d '{
    "postagemId": "POSTAGEM_ID",
    "usuarioId": "USUARIO_ID",
    "conteudo": "Excelente implementação!"
  }'
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

### Dar Like em Postagem

```bash
curl -X POST http://localhost:3000/postagens/POSTAGEM_ID/like
```

### Atualizar Postagem

```bash
curl -X PUT http://localhost:3000/postagens/POSTAGEM_ID \
  -H "Content-Type: application/json" \
  -d '{"conteudo": "Conteúdo atualizado!"}'
```

### Buscar Postagens por Termo

```bash
curl "http://localhost:3000/postagens/buscar?termo=coleções"
```

### Buscar Usuário por Email

```bash
curl http://localhost:3000/usuarios/email/jean@example.com
```

## Fluxo Completo de Teste

Execute em sequência para testar tudo:

```bash
USUARIO_ID=$(curl -s -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome": "Jean Alves", "email": "jean@example.com", "senha": "senha123"}' \
  | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)

echo "Usuário criado: $USUARIO_ID"

POSTAGEM_ID=$(curl -s -X POST http://localhost:3000/postagens \
  -H "Content-Type: application/json" \
  -d "{\"usuarioId\": \"$USUARIO_ID\", \"conteudo\": \"Teste completo!\"}" \
  | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)

echo "Postagem criada: $POSTAGEM_ID"

curl -s -X POST http://localhost:3000/comentarios \
  -H "Content-Type: application/json" \
  -d "{\"postagemId\": \"$POSTAGEM_ID\", \"usuarioId\": \"$USUARIO_ID\", \"conteudo\": \"Ótimo!\"}"

echo -e "\n\nListando postagens com join:"
curl -s http://localhost:3000/postagens | json_pp

echo -e "\n\nListando comentários com join:"
curl -s http://localhost:3000/postagens/$POSTAGEM_ID/comentarios | json_pp

echo -e "\n\nVerificando logs:"
tail -20 logs/$(date +%Y-%m-%d).log
```
