# Roteiro de Apresentação do Backend — PontoMax

## 1. Visão geral do projeto

O PontoMax é uma aplicação web para registro e gestão de ponto eletrônico em pequenas e médias empresas.

O sistema foi desenvolvido para:

- facilitar o registro diário de ponto;
- reduzir controles manuais;
- garantir consistência nos registros;
- controlar jornadas, feriados e ajustes;
- oferecer indicadores para gestores;
- manter rastreabilidade sobre operações sensíveis.

O PontoMax é multiempresa: cada empresa possui seus próprios usuários, jornadas, feriados, registros e solicitações.

---

## 2. Arquitetura escolhida

O projeto utiliza um monorepo gerenciado com `pnpm`:

```text
PontoMax
├── apps/web       → Frontend em Next.js
├── apps/api       → Backend em Express e TypeScript
└── prisma         → Schema e migrations do PostgreSQL
```

### Fluxo de uma requisição

```text
Requisição HTTP
      ↓
Middlewares de segurança, autenticação e validação
      ↓
Router do módulo
      ↓
Serviços e regras de negócio
      ↓
Prisma ORM
      ↓
PostgreSQL
```

### Tecnologias principais

- Node.js;
- TypeScript;
- Express;
- Prisma ORM;
- PostgreSQL;
- Zod;
- JWT;
- Vitest;
- Supertest;
- Neon para o banco de dados;
- Vercel para publicação.

### Por que essa arquitetura?

O backend foi dividido por módulos de domínio. Essa organização permite localizar rapidamente as regras de cada área e reduz o acoplamento entre funcionalidades.

Os módulos principais são:

- autenticação;
- empresas;
- usuários;
- jornadas;
- feriados;
- registros de ponto;
- solicitações de ajuste;
- auditoria;
- analytics.

Arquivos introdutórios:

- `apps/api/src/app.ts`;
- `apps/api/src/modules/index.ts`;
- `prisma/schema.prisma`.

---

## 3. Inicialização da API

Arquivo:

```text
apps/api/src/app.ts
```

Esse arquivo é responsável por:

- criar a aplicação Express;
- habilitar cabeçalhos de segurança com Helmet;
- configurar CORS;
- interpretar JSON;
- disponibilizar o endpoint `/health`;
- montar os módulos da API;
- registrar os tratamentos globais de rota inexistente e erro.

### Explicação sugerida

> A criação da aplicação fica separada da abertura da porta HTTP. Isso permite importar a aplicação diretamente nos testes sem precisar iniciar um servidor real.

O endpoint `/health` também permite que serviços de hospedagem e monitoramento verifiquem se a API está respondendo.

---

## 4. Organização modular

Arquivo:

```text
apps/api/src/modules/index.ts
```

Esse arquivo reúne os routers dos módulos:

```text
/adjustment-requests
/audit-logs
/analytics
/auth
/companies
/holidays
/time-records
/users
/work-schedules
```

### Decisão arquitetural

Cada módulo concentra as operações relacionadas a uma área do negócio. Assim, alterações em autenticação, por exemplo, ficam separadas das regras de registro de ponto.

---

## 5. Módulo principal: registro de ponto

Arquivos:

```text
apps/api/src/modules/time-records/time-records.routes.ts
apps/api/src/modules/time-records/time-records.service.ts
apps/api/src/common/utils/time-records.ts
```

Esse é o coração do sistema.

### Registro de uma nova batida

A função `createTimeEntry`:

1. identifica a data efetiva da jornada;
2. verifica se existe uma jornada anterior ainda aberta;
3. cria ou encontra o `Workday`;
4. busca as batidas ativas;
5. descobre se a próxima batida deve ser entrada ou saída;
6. impede uma batida anterior ou igual à última;
7. calcula o próximo número de sequência;
8. salva a localização opcional;
9. cria o registro;
10. recalcula o resumo completo do dia.

### Explicação sugerida

> Nós não tratamos uma batida como um registro isolado. Cada nova batida modifica o estado consolidado da jornada do funcionário.

### Regras importantes

- A sequência precisa alternar entre `ENTRY` e `EXIT`.
- O sistema pode inferir automaticamente o tipo da próxima batida.
- Uma nova batida deve ocorrer depois da última.
- As batidas possuem sequência incremental.
- A localização pode ser armazenada com latitude, longitude e precisão.
- O fuso horário utilizado também é registrado.

---

## 6. Recálculo da jornada

Função:

```text
recalculateWorkday
```

Arquivo:

```text
apps/api/src/modules/time-records/time-records.service.ts
```

Essa função:

- busca apenas registros ativos;
- encontra a jornada vigente do usuário naquela data;
- verifica se a data é um feriado aplicável à empresa;
- identifica jornadas noturnas;
- trata registros que atravessam a meia-noite;
- calcula minutos trabalhados;
- calcula minutos noturnos;
- calcula horas extras;
- calcula horas faltantes;
- verifica atrasos;
- valida a sequência de entrada e saída;
- atualiza o status consolidado do dia.

### Decisão arquitetural

O `Workday` armazena valores consolidados, enquanto `TimeEntry` armazena os eventos individuais.

Isso evita recalcular todos os indicadores sempre que uma tela consulta o histórico.

### Explicação sugerida

> Os registros individuais são a fonte dos acontecimentos, enquanto o Workday funciona como uma visão consolidada da jornada.

---

## 7. Solicitações de ajuste

Arquivo:

```text
apps/api/src/modules/adjustment-requests/adjustment-requests.routes.ts
```

Esse fluxo demonstra várias decisões importantes:

- autorização por perfil;
- isolamento entre empresas;
- uso de transação;
- preservação do histórico;
- validação do resultado final;
- recálculo da jornada;
- geração de auditoria.

### Aprovação de um ajuste

Durante uma aprovação, o backend:

1. verifica se o administrador pode analisar a solicitação;
2. inicia uma transação;
3. atualiza o estado da solicitação;
4. aplica inclusões, alterações ou exclusões;
5. consulta a sequência final de batidas;
6. valida se a sequência continua consistente;
7. desfaz a transação se houver inconsistência;
8. recalcula a jornada;
9. atualiza o status do dia;
10. registra a operação na auditoria.

### Preservação do histórico

Uma batida alterada não é simplesmente sobrescrita.

O registro anterior recebe o status:

```text
SUPERSEDED
```

Depois, uma nova versão é criada com a origem:

```text
ADJUSTMENT
```

### Explicação sugerida

> Em controle de ponto, apagar o passado seria perigoso. Por isso preservamos o registro original e criamos uma nova versão rastreável.

### Por que utilizar uma transação?

A aprovação modifica diversas entidades. A transação garante que todas as alterações sejam concluídas juntas.

Se a sequência final for inválida, nenhuma alteração parcial permanece no banco.

---

## 8. Autenticação e autorização

Arquivos:

```text
apps/api/src/common/auth/auth.middleware.ts
apps/api/src/common/auth/require-role.middleware.ts
apps/api/src/modules/auth/auth.routes.ts
```

### Middleware de autenticação

O middleware:

- exige um token Bearer;
- verifica o access token;
- extrai usuário, empresa, perfil e e-mail;
- adiciona essas informações à requisição;
- rejeita tokens inválidos ou expirados.

### Autorização por perfil

O middleware `requireRole` permite restringir uma rota a determinados perfis.

Exemplos de perfis:

- administrador da plataforma;
- administrador da empresa;
- funcionário.

### Sessões

O sistema utiliza:

- access token de curta duração;
- refresh token;
- sessão persistida no banco;
- revogação durante o logout;
- expiração de sessão.

### Decisão arquitetural

> O JWT permite autenticação rápida, enquanto a sessão persistida permite revogação e logout real.

O sistema também possui:

- troca obrigatória de senha;
- recuperação de senha;
- expiração dos tokens de recuperação anteriores;
- revogação de sessões após redefinição de senha.

---

## 9. Isolamento multiempresa

Arquivo:

```text
apps/api/src/common/utils/company-scope.ts
```

As regras principais são:

- o administrador da plataforma pode selecionar uma empresa;
- usuários comuns sempre ficam limitados à própria empresa;
- um administrador da plataforma sem empresa padrão precisa informar a empresa desejada;
- filtros enviados pelo frontend não são considerados uma barreira de segurança.

### Explicação sugerida

> O isolamento multiempresa é garantido pelo backend. Um usuário não consegue acessar outra empresa apenas modificando parâmetros enviados pelo frontend.

---

## 10. Validação de requisições

Arquivo:

```text
apps/api/src/common/validation/validate-request.ts
```

O backend utiliza Zod para validar:

- corpo da requisição;
- parâmetros da URL;
- query strings.

Os dados validados e normalizados são colocados novamente na requisição antes da execução da rota.

### Benefícios

- reduz verificações repetidas nas rotas;
- impede que dados inválidos alcancem as regras de negócio;
- padroniza mensagens de validação;
- melhora a inferência de tipos.

---

## 11. Tratamento global de erros

Arquivo:

```text
apps/api/src/common/middlewares/error-handler.middleware.ts
```

O tratamento global reconhece:

- erros controlados da aplicação;
- erros de validação do Zod;
- conflitos de unicidade do Prisma;
- violações de chave estrangeira;
- erros internos inesperados.

### Decisão arquitetural

As rotas não precisam repetir a construção das respostas de erro. O middleware transforma diferentes erros em respostas HTTP consistentes.

Exemplos:

- `400` para requisição inválida;
- `401` para ausência ou falha de autenticação;
- `403` para falta de permissão;
- `409` para conflitos;
- `500` para falhas inesperadas.

---

## 12. Auditoria

Arquivo:

```text
apps/api/src/common/audit/audit-log.service.ts
```

O módulo de auditoria registra:

- usuário responsável;
- empresa;
- entidade modificada;
- identificador da entidade;
- ação executada;
- resumo da operação;
- detalhes e alterações.

O serviço também:

- normaliza datas;
- normaliza objetos e arrays;
- calcula diferenças entre estado anterior e posterior;
- transforma os metadados em JSON.

### Explicação sugerida

> Como o sistema manipula informações sensíveis de jornada, não basta saber o estado atual. Também precisamos saber quem realizou cada alteração e o que mudou.

---

## 13. Analytics

Arquivo:

```text
apps/api/src/modules/analytics/analytics.service.ts
```

O dashboard calcula:

- funcionários ativos;
- funcionários presentes;
- jornadas atrasadas;
- horas extras;
- solicitações pendentes;
- jornadas inconsistentes;
- saldo de horas por funcionário;
- evolução diária das solicitações.

As consultas independentes são executadas em paralelo com `Promise.all`.

### Decisão arquitetural

As regras do dashboard ficam no serviço de analytics, separadas das rotas HTTP e das regras de registro de ponto.

---

## 14. Modelo de dados

Arquivo:

```text
prisma/schema.prisma
```

### Relações principais

```text
Client
  └── Company
       ├── User
       ├── Journey
       ├── Holiday
       ├── Workday
       │    └── TimeEntry
       ├── AdjustmentRequest
       │    └── PointAdjustment
       ├── AuthSession
       └── AuditLog
```

### Decisões do modelo

#### Cliente e empresa

Um cliente pode possuir várias empresas.

Cada empresa mantém seus próprios:

- usuários;
- jornadas;
- feriados;
- registros;
- solicitações;
- logs de auditoria.

#### Histórico de jornadas

A relação `UserJourneyAssignment` possui:

- `validFrom`;
- `validTo`.

Isso permite saber qual jornada estava vigente em uma data passada.

#### Resumo e eventos

O `Workday` armazena o resumo do dia.

O `TimeEntry` armazena cada entrada ou saída.

#### Feriados

A tabela associativa `HolidayCompany` permite aplicar um feriado a uma ou mais empresas.

#### Índices

Foram criados índices para consultas recorrentes, como:

- empresa e data;
- empresa e status;
- usuário e horário;
- empresa e perfil;
- usuário e status da sessão.

---

## 15. Estratégia de testes

A suíte utiliza:

- Vitest como test runner;
- Supertest para requisições HTTP;
- mocks do Prisma;
- mocks de serviços externos;
- cobertura V8.

Existem três camadas principais de teste.

### 15.1 Testes unitários

Testam funções puras e regras isoladas.

Exemplo:

```text
apps/api/tests/common/utils/time-records.test.ts
```

Esse arquivo testa:

- soma dos pares de entrada e saída;
- ordenação cronológica;
- registros sem par;
- sequência alternada válida;
- tipos consecutivos inválidos;
- horários não crescentes.

### 15.2 Testes de serviços

Exemplo:

```text
apps/api/tests/modules/time-records/time-records.service.test.ts
```

Os testes verificam:

- recálculo da jornada;
- minutos previstos e trabalhados;
- horas extras e faltantes;
- trabalho noturno;
- inferência da próxima batida;
- recálculo depois de uma nova batida;
- rejeição de horários sobrepostos.

### 15.3 Testes HTTP

Exemplos:

```text
apps/api/tests/modules/auth/auth.routes.test.ts
apps/api/tests/modules/adjustment-requests/adjustment-requests.routes.test.ts
```

Esses testes sobem uma aplicação Express em memória e fazem requisições com Supertest.

Eles verificam:

- status HTTP;
- corpo da resposta;
- validação;
- autenticação;
- autorização;
- chamadas aos serviços;
- transações;
- tratamento de erros.

---

## 16. Testes interessantes para demonstrar

### Cálculo de horas

Arquivo:

```text
apps/api/tests/common/utils/time-records.test.ts
```

O teste fornece registros fora de ordem:

```text
08:00 → entrada
12:00 → saída
13:00 → entrada
17:00 → saída
```

O resultado esperado é:

```text
480 minutos
```

Esse teste demonstra que a função ordena os eventos e calcula os pares corretamente.

### Recálculo de jornada

Arquivo:

```text
apps/api/tests/modules/time-records/time-records.service.test.ts
```

O teste verifica uma jornada de 480 minutos com quatro registros válidos.

Resultado esperado:

- 480 minutos trabalhados;
- zero horas extras;
- zero minutos faltantes;
- status fechado.

### Jornada noturna

O mesmo serviço testa registros que atravessam a madrugada e verifica o cálculo dos minutos noturnos.

### Aprovação de ajuste

Arquivo:

```text
apps/api/tests/modules/adjustment-requests/adjustment-requests.routes.test.ts
```

O teste cria uma solicitação com novas batidas e verifica:

- aplicação dentro da transação;
- consulta da sequência final;
- validação da alternância;
- recálculo do `Workday`;
- atualização para o status `ADJUSTED`.

Também existe um teste que confirma que uma sequência inválida é rejeitada.

### Autenticação

Arquivo:

```text
apps/api/tests/modules/auth/auth.routes.test.ts
```

Os testes cobrem:

- login com sucesso;
- criação de sessão;
- troca obrigatória de senha;
- refresh token inválido;
- renovação de tokens;
- logout;
- recuperação de senha;
- revogação de sessões.

---

## 17. Resultado atual dos testes

A suíte foi executada em **20 de junho de 2026**.

Resultado:

```text
Test Files  31 passed
Tests       111 passed
Falhas      0
Duração     3,30 segundos
```

Comando utilizado:

```bash
pnpm --filter ponto-max-api test
```

O arquivo `RELATORIO_TESTES.md`, produzido em 18 de maio de 2026, menciona 91 testes. A suíte evoluiu desde então e atualmente possui 111 testes aprovados.

---

## 18. Roteiro falado — 10 a 12 minutos

### Parte 1 — Problema e objetivo

Tempo sugerido: 1 minuto.

> O PontoMax é uma plataforma multiempresa para registro e gestão de ponto. O desafio não é apenas armazenar horários, mas garantir consistência, segurança, rastreabilidade e uma visão gerencial das jornadas.

### Parte 2 — Arquitetura

Tempo sugerido: 2 minutos.

> Escolhemos um monorepo com frontend e API separados. O backend utiliza Express e TypeScript, Prisma para acesso tipado ao PostgreSQL e módulos organizados pelas áreas do domínio.

Mostrar:

1. `apps/api/src/app.ts`;
2. `apps/api/src/modules/index.ts`;
3. `prisma/schema.prisma`.

### Parte 3 — Fluxo principal de registro

Tempo sugerido: 3 minutos.

> Quando o usuário registra uma batida, o backend identifica a jornada correta, verifica a sequência, registra o evento e recalcula todo o dia.

Mostrar:

1. `createTimeEntry`;
2. validação da próxima batida;
3. geração da sequência;
4. chamada de `recalculateWorkday`;
5. cálculos de horas trabalhadas, extras, faltantes e noturnas.

### Parte 4 — Ajustes e integridade

Tempo sugerido: 2 minutos.

> Ajustes são operações sensíveis. Eles são processados em uma transação, preservam os registros anteriores e só são aprovados se o resultado final continuar consistente.

Mostrar:

1. autorização por perfil;
2. `prisma.$transaction`;
3. status `SUPERSEDED`;
4. validação de sequência;
5. recálculo;
6. auditoria.

### Parte 5 — Segurança e multiempresa

Tempo sugerido: 1 minuto.

> Toda requisição autenticada recebe usuário, perfil e empresa. O backend garante que usuários comuns permaneçam limitados à própria empresa.

Mostrar:

1. `authenticate`;
2. `requireRole`;
3. `getRequestCompanyId`.

### Parte 6 — Testes

Tempo sugerido: 2 minutos.

> A estratégia combina testes unitários para regras puras, testes de serviços com dependências mockadas e testes HTTP com Supertest.

Mostrar:

1. `time-records.test.ts`;
2. `time-records.service.test.ts`;
3. `adjustment-requests.routes.test.ts`;
4. resultado de 111 testes aprovados.

### Parte 7 — Encerramento

Tempo sugerido: 30 segundos.

> As decisões priorizaram consistência do domínio, isolamento multiempresa e rastreabilidade. O resultado é um backend modular, testável e preparado para evolução.

---

## 19. Ordem recomendada dos arquivos durante a apresentação

Abra previamente estes arquivos no editor:

1. `apps/api/src/app.ts`;
2. `apps/api/src/modules/index.ts`;
3. `prisma/schema.prisma`;
4. `apps/api/src/modules/time-records/time-records.service.ts`;
5. `apps/api/src/modules/adjustment-requests/adjustment-requests.routes.ts`;
6. `apps/api/src/common/utils/company-scope.ts`;
7. `apps/api/src/common/auth/auth.middleware.ts`;
8. `apps/api/src/common/audit/audit-log.service.ts`;
9. `apps/api/tests/common/utils/time-records.test.ts`;
10. `apps/api/tests/modules/time-records/time-records.service.test.ts`;
11. `apps/api/tests/modules/adjustment-requests/adjustment-requests.routes.test.ts`;
12. `apps/api/tests/modules/auth/auth.routes.test.ts`.

Não é necessário apresentar todos. Eles devem ficar abertos para facilitar respostas a perguntas.

---

## 20. Possíveis perguntas e respostas

### Por que Express?

> Express oferece uma estrutura simples e madura para APIs HTTP. Como as regras do projeto estão organizadas por módulos e serviços, não era necessário adotar um framework mais opinativo.

### Por que Prisma?

> O Prisma oferece consultas tipadas, migrations, relacionamentos claros e tratamento conhecido de erros do banco. Isso reduz erros entre o código TypeScript e o PostgreSQL.

### Por que armazenar o resumo no Workday?

> Para evitar recalcular todos os registros sempre que o histórico ou o dashboard forem consultados. Os eventos continuam preservados em TimeEntry, e o resumo pode ser recalculado quando necessário.

### Por que não apagar uma batida corrigida?

> Porque registros de ponto precisam de rastreabilidade. O registro anterior é preservado como SUPERSEDED, e a correção gera um novo registro.

### Como o sistema impede acesso entre empresas?

> A empresa é obtida a partir do usuário autenticado. Usuários comuns não conseguem substituir esse valor por um parâmetro arbitrário.

### O que acontece se um ajuste produzir uma sequência inválida?

> A validação lança um erro dentro da transação. O banco desfaz todas as alterações realizadas naquela aprovação.

### Os testes usam banco de dados real?

> A suíte principal utiliza mocks do Prisma para manter velocidade e previsibilidade. Como evolução, podem ser adicionados testes de integração com uma instância PostgreSQL isolada.

### Qual é a cobertura atual?

> O relatório anterior registrou cobertura elevada no escopo configurado pelo Vitest. É importante explicar que o arquivo de configuração seleciona módulos específicos para a métrica, então ela não representa automaticamente todo o backend.

---

## 21. Pontos fortes

- separação por módulos de domínio;
- regras críticas concentradas no backend;
- isolamento multiempresa;
- autenticação com sessões revogáveis;
- validação com Zod;
- tratamento global de erros;
- transações em alterações sensíveis;
- preservação do histórico;
- auditoria;
- testes unitários, de serviço e HTTP;
- suíte rápida, com 111 testes aprovados.

---

## 22. Possíveis evoluções

- extrair regras ainda presentes em routers grandes para serviços menores;
- adicionar testes de integração com PostgreSQL real;
- adicionar testes automatizados para o frontend;
- adicionar testes end-to-end dos fluxos principais;
- revisar continuamente o escopo da cobertura;
- ampliar observabilidade, métricas e logs estruturados.

### Explicação sugerida

> O sistema já possui uma base sólida, mas arquitetura também significa reconhecer os próximos passos. As evoluções principais seriam ampliar os testes de integração e continuar extraindo regras complexas das rotas.

---

## 23. Resumo final

O backend do PontoMax foi construído para resolver um domínio no qual consistência e rastreabilidade são essenciais.

As principais decisões foram:

1. organizar o código por módulos de negócio;
2. aplicar autenticação, autorização e isolamento no backend;
3. preservar eventos individuais e manter resumos recalculáveis;
4. usar transações em operações de ajuste;
5. manter histórico em vez de sobrescrever registros;
6. registrar operações sensíveis em auditoria;
7. testar regras puras, serviços e endpoints HTTP.

Frase final:

> Mais do que registrar horários, o backend foi projetado para preservar a consistência e a história de cada jornada.
