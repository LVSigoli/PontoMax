# Deploy de Producao

Este projeto foi preparado para o fluxo:

- `apps/web` em um projeto da `Vercel`
- `apps/api` em outro projeto da `Vercel`
- `Neon Postgres` como banco principal

## 1. Criar o banco no Neon

1. Crie um projeto no Neon
2. Copie duas connection strings:

- `DATABASE_URL`: use a URL `pooled`, com `-pooler` no hostname
- `DIRECT_URL`: use a URL `direct`, sem `-pooler`

3. Configure seu `.env` local na raiz do workspace:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@EP-EXAMPLE-pooler.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DIRECT_URL=postgresql://USER:PASSWORD@EP-EXAMPLE.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3333
API_PREFIX=api
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
APP_URL=http://localhost:3000
MAIL_FROM=PontoMax <no-reply@seudominio.com>
RESEND_API_KEY=
```

4. Rode as migrations e a seed:

```bash
pnpm run db:prepare
```

## 2. Publicar a API na Vercel

1. Importe o mesmo repositorio do GitHub na Vercel
2. Crie um projeto para `apps/api`
3. Defina `Root Directory` como `apps/api`
4. Adicione as variaveis de ambiente:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@EP-EXAMPLE-pooler.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DIRECT_URL=postgresql://USER:PASSWORD@EP-EXAMPLE.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require
API_PREFIX=api
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
APP_URL=https://seu-frontend.vercel.app
MAIL_FROM=PontoMax <no-reply@seudominio.com>
RESEND_API_KEY=
```

5. Execute o deploy

## 3. Publicar o frontend na Vercel

1. Crie outro projeto na Vercel para `apps/web`
2. Defina `Root Directory` como `apps/web`
3. Configure a variavel:

```bash
NEXT_PUBLIC_API_URL=https://sua-api-publica.vercel.app
```

4. Execute o deploy

## 4. Ajuste final

Depois que o frontend tiver uma URL final:

1. Volte ao projeto da API na Vercel
2. Atualize `APP_URL` com a URL publicada do frontend
3. Rode um redeploy da API

## 5. Verificacao

Depois do deploy:

1. Abra a tela de login do frontend
2. Valide `https://sua-api-publica.vercel.app/health`
3. Teste autenticacao com o usuario demo
4. Teste o fluxo de esqueci minha senha depois de configurar `RESEND_API_KEY`
