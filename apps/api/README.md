# Ponto Max API

Backend base em Node.js + TypeScript usando Express.

## Scripts

- `pnpm --filter ponto-max-api dev`: compila e sobe a API localmente
- `pnpm --filter ponto-max-api build`: gera a pasta `dist`
- `pnpm --filter ponto-max-api start`: inicia a API compilada
- `pnpm --filter ponto-max-api typecheck`: valida os tipos
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
- `GET /api/users`
- `GET /api/companies`
- `GET /api/holidays`
- `GET /api/time-records`
- `GET /api/work-schedules`

## Como testar localmente

1. Suba a API com `pnpm dev:api`
2. Em outro terminal, rode `pnpm --filter ponto-max-api smoke:build`

Se quiser testar manualmente, acesse `http://localhost:3333/health`.

## Credenciais demo

- `demo@pontomax.com.br`
- `123456`
