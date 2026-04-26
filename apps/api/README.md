# Ponto Max API

Backend do PontoMax em Node.js + TypeScript usando Express e Prisma.

## Scripts

- `pnpm --filter ponto-max-api dev`: compila e sobe a API localmente
- `pnpm --filter ponto-max-api build`: gera a pasta `dist`
- `pnpm --filter ponto-max-api start`: inicia a API compilada
- `pnpm --filter ponto-max-api typecheck`: valida os tipos
- `pnpm --filter ponto-max-api prisma:validate`: valida o schema Prisma compartilhado
- `pnpm --filter ponto-max-api prisma:generate`: gera o client Prisma
- `pnpm --filter ponto-max-api prisma:migrate`: cria e aplica migracoes locais
- `pnpm --filter ponto-max-api prisma:deploy`: aplica migracoes em ambiente alvo
- `pnpm --filter ponto-max-api seed:build`: compila e popula dados demo
- `pnpm --filter ponto-max-api smoke`: testa os endpoints base com a API em execucao
- `pnpm --filter ponto-max-api smoke:build`: compila e executa o smoke test

## Estrutura

- `src/config`: carregamento e validacao de ambiente
- `src/common`: middlewares compartilhados
- `src/modules`: modulos da API por dominio

## Endpoints base

- `GET /health`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/users`
- `POST /api/users`
- `GET /api/companies`
- `POST /api/companies`
- `GET /api/holidays`
- `POST /api/holidays`
- `GET /api/time-records`
- `POST /api/time-records/register`
- `GET /api/work-schedules`
- `POST /api/work-schedules`
- `GET /api/adjustment-requests`
- `POST /api/adjustment-requests`
- `PATCH /api/adjustment-requests/:requestId/review`
- `GET /api/analytics/overview`

## Ambiente

Crie um arquivo `.env` na raiz do workspace com base em `.env.example`.

Variaveis obrigatorias:

- `DATABASE_URL`
- `PORT`
- `API_PREFIX`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`

## Como testar localmente

1. Crie o `.env` na raiz do projeto
2. Gere o client Prisma com `pnpm --filter ponto-max-api prisma:generate`
3. Aplique o schema no PostgreSQL com `pnpm --filter ponto-max-api prisma:migrate`
4. Popule dados demo com `pnpm --filter ponto-max-api seed:build`
5. Suba a API com `pnpm dev:api`
6. Em outro terminal, rode `pnpm --filter ponto-max-api smoke:build`

Se quiser testar manualmente, acesse `http://localhost:3333/health`.

## Credenciais demo

- `demo@pontomax.com.br`
- `123456`
