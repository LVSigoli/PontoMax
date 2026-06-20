# Testes do projeto

Este projeto concentra a automacao de testes no backend, com foco em validar regras de negocio, rotas HTTP e funcoes puras. A ideia e garantir que as partes mais sensiveis do sistema continuem funcionando mesmo depois de refatoracoes.

## Estrutura geral

Os testes ficam em `apps/api/tests` e seguem uma organizacao por responsabilidade:

- `tests/app.test.ts` valida a aplicacao como um todo.
- `tests/modules/**` cobre os modulos de negocio do backend.
- `tests/common/**` cobre utilitarios, autenticacao, middlewares, validacoes e servicos compartilhados.

Essa separacao facilita explicar o projeto porque cada tipo de teste responde uma pergunta diferente:

- o app sobe e responde corretamente?
- a rota recebe a requisicao certa e chama o service correto?
- a regra de negocio calcula os valores esperados?
- a funcao utilitaria transforma dados sem erro?

## O que os testes do backend cobrem

### Testes de aplicacao

O arquivo `apps/api/tests/app.test.ts` verifica a estrutura base da API:

- endpoint de health check;
- prefixo padrao das rotas da API;
- tratamento global de erro;
- resposta de rota inexistente.

Esse teste mostra que a aplicacao esta montada corretamente antes mesmo de olhar para os modulos.

### Testes de rotas

Os testes em `apps/api/tests/modules/*/*.routes.test.ts` validam a camada HTTP.

Eles verificam, por exemplo:

- status code retornado;
- formato do payload;
- passagem correta de parametros para os services;
- integracao com autenticao, quando necessario;
- comportamento esperado quando a rota recebe uma requisicao valida.

Nessa camada, os servicos e o acesso ao banco sao normalmente mockados. Assim o teste fica rapido e focado na rota.

Exemplos no projeto:

- `time-records.routes.test.ts`
- `auth.routes.test.ts`
- `companies.routes.test.ts`
- `holidays.routes.test.ts`
- `analytics.routes.test.ts`

### Testes de service

Os testes em `apps/api/tests/modules/*/*.service.test.ts` validam a regra de negocio.

Eles sao mais importantes para garantir que o sistema continue calculando e tomando decisoes corretamente. Aqui o foco e confirmar:

- calculos de jornada e apontamento;
- serializacao de dados;
- validacoes de negocio;
- comportamento de fluxos mais complexos.

Exemplo forte do projeto:

- `time-records.service.test.ts`

Esse teste cobre cenarios como recalculo de jornada, horas noturnas, criacao de apontamento e validacao de entradas duplicadas ou invalidas.

### Testes de utilitarios e regras puras

Em `apps/api/tests/common/utils` e `apps/api/tests/common/auth`, o projeto testa funcoes menores e bem isoladas.

Esses testes sao uteis porque:

- sao rapidos;
- quebram cedo quando uma regra simples muda;
- deixam mais facil diagnosticar falhas.

Exemplos:

- `duration.test.ts`
- `date.test.ts`
- `company-scope.test.ts`
- `auth.middleware.test.ts`
- `password.service.test.ts`
- `validate-request.test.ts`

## Ferramentas usadas

O backend usa:

- `Vitest` para rodar os testes;
- `Supertest` para testar as rotas HTTP;
- `V8 coverage` para medir cobertura;
- `setup.ts` para preparar o ambiente de teste.

O arquivo `apps/api/vitest.config.ts` tambem define a cobertura minima esperada:

- linhas: 80%
- statements: 80%
- funcoes: 80%
- branches: 75%

Isso mostra que os testes nao sao apenas complementares; eles fazem parte do criterio de qualidade do backend.

## Como explicar na apresentacao

Uma forma simples de explicar e dizer que a estrategia foi dividida em tres niveis:

1. testes de aplicacao, para garantir que a API sobe e responde;
2. testes de rotas, para validar o contrato HTTP;
3. testes de service e utilitarios, para proteger a regra de negocio.

Em outras palavras, o backend nao depende de um unico tipo de teste. Cada camada protege uma parte diferente do sistema.

Tambem vale destacar que muitos testes usam mocks para isolar dependencias como Prisma, autenticacao e servicos externos. Isso deixa os testes mais previsiveis e rapidos.

## Como rodar

No backend:

- `pnpm --filter ponto-max-api test`
- `pnpm --filter ponto-max-api test:coverage`

## Situacao do frontend

Hoje o frontend nao tem uma suite automatizada de testes separada no repositorio.

O que ele tem como protecao pratica e:

- `typecheck`;
- `build`;
- organizacao modular dos componentes;
- validação visual manual durante a execucao.

Se fizer sentido depois, o proximo passo natural e adicionar testes de componentes e fluxos principais da interface.
