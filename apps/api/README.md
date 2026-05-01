# Ponto Max API

Backend do PontoMax em Node.js + TypeScript usando Express e Prisma.

Esta API pode ser publicada na Vercel com zero-config usando o arquivo `src/app.ts` como entrada do Express. Para deploy, use `apps/api` como `Root Directory` do projeto.

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

- `DATABASE_URL`
- `DIRECT_URL`
- `API_PREFIX`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `APP_URL`
- `MAIL_FROM` para envio real de e-mail
- `RESEND_API_KEY` para envio real de e-mail em producao

## Como testar localmente

1. Crie o `.env` na raiz do projeto
2. Garanta que o `DATABASE_URL` aponta para a URL pooler do Neon ou outro PostgreSQL acessivel
3. Garanta que o `DIRECT_URL` aponta para a conexao direta do Neon para migrations
4. Rode `pnpm run db:prepare`
5. Suba a API com `pnpm run dev:api`
6. Em outro terminal, rode `pnpm --filter ponto-max-api smoke:build`

Se quiser fazer tudo em um comando, use `pnpm run dev:backend`.

Se quiser testar manualmente, acesse `http://localhost:3333/health`.

## Producao

Fluxo sugerido:

1. Criar um projeto do banco no Neon
2. Configurar `DATABASE_URL` com a conexao pooler e `DIRECT_URL` com a conexao direta
3. Publicar `apps/api` como projeto na Vercel
4. Publicar `apps/web` como outro projeto na Vercel com `NEXT_PUBLIC_API_URL` apontando para a API
5. Configurar `RESEND_API_KEY` antes de usar envio de e-mail em producao

## Credenciais demo

- `demo@pontomax.com.br`
- `123456`
