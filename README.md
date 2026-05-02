# PontoMax

PontoMax é uma aplicacao web para registro e gestao de ponto eletronico em pequenas e medias empresas. O sistema foi pensado para reduzir controles manuais, melhorar a confiabilidade dos registros e oferecer uma visão gerencial clara sobre jornadas, horas extras, feriados, escalas e solicitacoes de ajuste.

## Objetivo

O produto atende empresas que precisam controlar a jornada de seus colaboradores de forma símples, confiável e flexível. A experiência principal deve ser rápida para o funcionario registrar ponto e robusta para gestores acompanharem inconsistencias, solicitacoes e indicadores operacionais.

## Contexto De Dominio

O PontoMax é multiempresa. Um cliente contratante pode possuir uma ou mais empresas no sistema, e cada empresa mantem seus proprios usuarios, jornadas, feriados e registros.

## Credenciais Demo

- `demo@pontomax.com.br`
- `123456`

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

O projeto usa `PostgreSQL`, com `Neon` para o banco e `Vercel` para frontend e API.
