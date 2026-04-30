# Deploy de Producao

Este projeto foi preparado para o fluxo:

- `apps/web` na `Vercel`
- `apps/api` no `Railway`
- `PostgreSQL` como banco principal

## 1. Publicar a API no Railway

1. Importe o repositorio do GitHub no Railway
2. Crie um servico para `apps/api`
3. Adicione um banco `PostgreSQL` no mesmo projeto
4. Configure as variaveis:

```bash
DATABASE_URL=
PORT=3333
API_PREFIX=api
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
APP_URL=https://seu-frontend.vercel.app
MAIL_FROM=PontoMax <no-reply@seudominio.com>
RESEND_API_KEY=
```

5. Rode as migrations com:

```bash
pnpm --filter ponto-max-api prisma:deploy
pnpm --filter ponto-max-api seed:build
```

## 2. Publicar o frontend na Vercel

1. Importe o mesmo repositorio do GitHub na Vercel
2. Defina `Root Directory` como `apps/web`
3. Configure a variavel:

```bash
NEXT_PUBLIC_API_URL=https://sua-api-publica.com
```

4. Execute o deploy

## 3. Verificacao

Depois do deploy:

1. Abra a tela de login do frontend
2. Valide `https://sua-api-publica.com/health`
3. Teste autenticacao com o usuario demo
