# Modelo de banco de dados

Este projeto agora tem uma modelagem base para `Next.js + PostgreSQL` em dois formatos:

- `prisma/schema.prisma`: modelo principal para a aplicacao
- `database/schema.sql`: DDL SQL equivalente para criar o banco direto no PostgreSQL

## O que foi modelado

- `clients`: representa o contratante, necessario porque o README descreve um sistema multiempresa
- `companies`: empresas vinculadas a um cliente
- `users`: funcionarios, gestores e administradores
- `journeys`: jornadas configuradas por empresa
- `user_journey_assignments`: historico de vigencia da jornada por usuario
- `holidays`: feriados por empresa
- `workdays`: consolidado diario do ponto
- `time_entries`: batidas de entrada e saida
- `adjustment_requests`: solicitacoes de ajuste
- `point_adjustments`: itens do ajuste que criam, alteram ou removem batidas
- `auth_sessions`: sessoes de autenticacao
- `password_reset_tokens`: recuperacao de senha
- `audit_logs`: trilha de auditoria

## Decisoes importantes

- O diagrama foi separado em `workdays` e `time_entries`. Isso facilita calculo de saldo, extras, inconsistencias e historico.
- A relacao entre usuario e jornada foi feita por tabela de vigencia (`user_journey_assignments`), porque seu DER ja sugere `periodo_vigencia`.
- Ajustes nao editam a batida diretamente. O fluxo ideal e: abrir solicitacao, aprovar, marcar a batida antiga como `SUPERSEDED` e gerar a nova com origem `ADJUSTMENT`.
- `workdays` guarda campos consolidados em minutos. Isso ajuda muito no dashboard e nos filtros sem recalcular tudo a cada tela.

## O que faltava no modelo original

- Entidade `Cliente` ou `Tenant`: o README fala em multiempresa, mas o DER mostrado comeca em `Empresa`
- Autenticacao real: sessao, refresh token e reset de senha
- Auditoria: essencial para ponto eletronico e analise de ajustes
- Historico de jornada por vigencia: no desenho existe, mas como conceito; no banco isso precisa virar tabela
- Status tecnico das batidas: ativa, substituida, pendente de revisao, rejeitada
- Campos operacionais por empresa, como `timezone`

## Sugestoes de evolucao

- Adicionar `geolocalizacao`, `ip` e `device_info` nas batidas, se voce quiser validar origem do registro
- Criar politicas por empresa para banco de horas, tolerancia e fechamento mensal
- Criar tabela de anexos para solicitacoes de ajuste
- Criar calendario de escalas mais detalhado se houver turnos variaveis por dia

## Proximo passo no Next.js

Se quiser seguir com Prisma, o fluxo natural e:

```bash
pnpm add prisma @prisma/client
pnpm prisma init
pnpm prisma migrate dev --name init
```

Depois disso, podemos montar:

- `src/lib/prisma.ts`
- repositorios ou services
- rotas `src/pages/api/...`
- seeds com empresas, usuarios, jornadas e feriados
