# Ponto Max API

Backend do PontoMax em Node.js + TypeScript usando Express e Prisma.

## Scripts

- `pnpm --filter ponto-max-api dev`: compila e sobe a API localmente
- `pnpm --filter ponto-max-api build`: gera a pasta `dist`
- `pnpm --filter ponto-max-api start`: inicia a API compilada
- `pnpm --filter ponto-max-api typecheck`: valida os tipos
- `pnpm --filter ponto-max-api prisma:validate`: valida o schema Prisma compartilhado
- `pnpm --filter ponto-max-api prisma:generate`: gera o client Prisma
- `pnpm --filter ponto-max-api db:prepare`: gera o client Prisma, aplica as migrations e roda a seed demo
- `pnpm --filter ponto-max-api prisma:push`: sincroniza o schema diretamente com o banco configurado
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

Variavel obrigatoria adicional:

- `DATABASE_URL`

## Como testar localmente

1. Crie o `.env` na raiz do projeto
2. Garanta que o `DATABASE_URL` aponta para um PostgreSQL acessivel
3. Rode `pnpm run db:prepare`
4. Suba a API com `pnpm run dev:api`
5. Em outro terminal, rode `pnpm --filter ponto-max-api smoke:build`

Se quiser fazer tudo em um comando, use `pnpm run dev:backend`.

Se quiser testar manualmente, acesse `http://localhost:3333/health`.

## Producao

Fluxo sugerido:

1. Hospedar a API no Railway
2. Provisionar um PostgreSQL no Railway
3. Configurar as variaveis de ambiente da API
4. Publicar o `apps/web` na Vercel com `NEXT_PUBLIC_API_URL` apontando para a API publicada

## Credenciais demo

- `demo@pontomax.com.br`
- `123456`
