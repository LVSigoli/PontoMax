# PontoMax

PontoMax e uma aplicacao web para registro e gestao de ponto eletronico em pequenas e medias empresas. O sistema foi pensado para reduzir controles manuais, melhorar a confiabilidade dos registros e oferecer uma visao gerencial clara sobre jornadas, horas extras, feriados, escalas e solicitacoes de ajuste.

## Objetivo

O produto atende empresas que precisam controlar a jornada de seus colaboradores de forma simples, confiavel e flexivel. A experiencia principal deve ser rapida para o funcionario registrar ponto e robusta para gestores acompanharem inconsistencias, solicitacoes e indicadores operacionais.

## Contexto De Dominio

O PontoMax e multiempresa. Um cliente contratante pode possuir uma ou mais empresas no sistema, e cada empresa mantem seus proprios usuarios, jornadas, feriados e registros.

Perfis principais:

- Funcionario: registra ponto, consulta historico e solicita ajustes.
- Gerente: analisa solicitacoes de ajuste, aprovando ou recusando correcoes.
- Cliente: representa o contratante do servico e pode agrupar multiplas empresas.

## Regras De Negocio

- Uma empresa pode possuir varios usuarios.
- Um usuario pertence a apenas uma empresa.
- Um usuario segue uma jornada.
- Uma jornada pode estar associada a varios usuarios.
- Uma empresa pode possuir varios feriados cadastrados.
- Um usuario pode registrar varios pontos.
- Um usuario pode criar varias solicitacoes de ajuste.
- Usuarios gerenciais podem analisar solicitacoes de ajuste.
- Registros de ponto nao devem ser editados diretamente.
- Alteracoes devem ocorrer apenas via solicitacao de ajuste.
- Feriados e dias nao uteis podem impactar o calculo de horas extras.
- O sistema deve preservar integridade, auditoria e historico das operacoes.

## Modulos

- Autenticacao e recuperacao de senha.
- Gestao de clientes.
- Gestao de empresas.
- Gestao de usuarios.
- Configuracao de jornadas.
- Configuracao de feriados.
- Registro de ponto.
- Historico de jornada.
- Solicitacao e analise de ajustes.
- Dashboard com indicadores gerenciais.

## Entidades Principais

- Cliente
- Empresa
- Usuario
- Jornada
- Feriado
- Registro de Ponto
- Solicitacao de Ajuste
- Ajuste de Ponto

## Scripts

```bash
pnpm run db:prepare
pnpm run dev:api
pnpm run dev:backend
pnpm run dev:http
pnpm run build
pnpm run lint
pnpm run typecheck
pnpm run format
pnpm run format:check
```

## Banco E Ambiente

O projeto agora esta preparado para `PostgreSQL`, pensando em deploy real com `Neon` para o banco e `Vercel` para frontend e API.

Fluxo recomendado para ambiente local ou homologacao:

```bash
pnpm run db:prepare
pnpm run dev:api
```

Ou, se preferir fazer tudo em um comando:

```bash
pnpm run dev:backend
```

Detalhes do setup:

- banco padrao: `PostgreSQL`
- `DATABASE_URL` e obrigatoria
- `DIRECT_URL` e recomendada para migrations no Neon
- `pnpm run db:prepare`: gera o client Prisma, aplica as migrations e roda a seed demo
- migration inicial: `prisma/migrations/20260430195000_init_postgres/migration.sql`

Exemplo de conexoes no Neon:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@EP-EXAMPLE-pooler.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://USER:PASSWORD@EP-EXAMPLE.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## Credenciais Demo

- `demo@pontomax.com.br`
- `123456`

## Deploy Recomendado

- frontend `apps/web`: projeto `Vercel`
- backend `apps/api`: projeto `Vercel` com `Express`
- banco: `Neon Postgres`

Variaveis principais:

- Vercel/web: `NEXT_PUBLIC_API_URL`
- Vercel/api: `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `APP_URL`, `MAIL_FROM`, `RESEND_API_KEY`

## Diretrizes Tecnicas

- Priorizar simplicidade e clareza de dominio.
- Separar responsabilidades sem excesso de abstracao.
- Manter nomes consistentes com o negocio de ponto eletronico.
- Preservar rastreabilidade em ajustes de ponto.
- Evitar edicao direta de registros ja criados.
- Favorecer codigo legivel, testavel e adequado para evolucao academica e pratica.
