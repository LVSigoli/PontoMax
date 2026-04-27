# Ponto Max API

Backend do PontoMax em Node.js + TypeScript usando Express e Prisma.

## Scripts

- `pnpm --filter ponto-max-api dev`: compila e sobe a API localmente
- `pnpm --filter ponto-max-api build`: gera a pasta `dist`
- `pnpm --filter ponto-max-api start`: inicia a API compilada
- `pnpm --filter ponto-max-api typecheck`: valida os tipos
- `pnpm --filter ponto-max-api prisma:validate`: valida o schema Prisma compartilhado
- `pnpm --filter ponto-max-api prisma:generate`: gera o client Prisma
- `pnpm --filter ponto-max-api prisma:push`: sincroniza o schema com o banco SQLite local
- `pnpm --filter ponto-max-api seed:build`: compila e popula dados demo
- `pnpm --filter ponto-max-api smoke`: testa os endpoints base com a API em execucao
- `pnpm --filter ponto-max-api smoke:build`: compila e executa o smoke test

## Ambiente

Crie um arquivo `.env` na raiz do workspace com base em `.env.example`.

Variaveis obrigatorias:

- `PORT`
- `API_PREFIX`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`

Variavel opcional:

- `DATABASE_URL`: se nao for informada, a API usa o banco local SQLite padrao

## Como testar localmente

1. Crie o `.env` na raiz do projeto
2. Rode `pnpm run db:prepare`
3. Suba a API com `pnpm run dev:api`
4. Em outro terminal, rode `pnpm --filter ponto-max-api smoke:build`

Se quiser fazer tudo em um comando, use `pnpm run dev:backend`.

Se quiser testar manualmente, acesse `http://localhost:3333/health`.

## Credenciais demo

- `demo@pontomax.com.br`
- `123456`
