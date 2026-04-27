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

## Banco Local

O projeto agora roda localmente com `SQLite`, sem instalar banco separado.

Fluxo recomendado:

```bash
pnpm run db:prepare
pnpm run dev:api
```

Ou, se preferir fazer tudo em um comando:

```bash
pnpm run dev:backend
```

Detalhes do setup:

- banco padrao: `SQLite`
- arquivo do banco: `prisma/dev.db`
- `DATABASE_URL` e opcional; se voce nao definir nada, o projeto usa `file:./dev.db`
- `pnpm run db:prepare`: sincroniza o schema no SQLite e roda a seed demo

## Credenciais Demo

- `demo@pontomax.com.br`
- `123456`

## Diretrizes Tecnicas

- Priorizar simplicidade e clareza de dominio.
- Separar responsabilidades sem excesso de abstracao.
- Manter nomes consistentes com o negocio de ponto eletronico.
- Preservar rastreabilidade em ajustes de ponto.
- Evitar edicao direta de registros ja criados.
- Favorecer codigo legivel, testavel e adequado para evolucao academica e pratica.
