# Explicação da Arquitetura do Backend

O backend utiliza uma **arquitetura modular em camadas, organizada por domínio**.

## Visão geral

```text
Requisição HTTP
      ↓
Router e middlewares
      ↓
Validação com Zod
      ↓
Service ou caso de uso
      ↓
Regras de domínio
      ↓
Repository e Prisma
      ↓
PostgreSQL
```

Cada área do negócio possui seu próprio módulo:

```text
modules/
├── auth/
├── users/
├── companies/
├── work-schedules/
├── holidays/
├── time-records/
├── adjustment-requests/
├── analytics/
└── audit-logs/
```

## Responsabilidade de cada camada

### Routes

As rotas recebem a requisição HTTP e devolvem a resposta.

Também aplicam:

- autenticação;
- autorização por perfil;
- validação;
- escopo da empresa.

Explicação sugerida:

### Schemas

Os schemas utilizam Zod para validar:

- corpo da requisição;
- parâmetros da URL;
- query strings.

Explicação sugerida:

### Services

Os services coordenam os casos de uso do sistema.

Exemplos:

- criar um funcionário;
- registrar uma batida;
- aprovar uma solicitação;
- recalcular uma jornada;
- criar uma empresa;
- configurar um feriado.

Explicação sugerida:

### Rules

As rules representam regras puras do negócio, sem dependência de HTTP.

Exemplos:

- alternância entre entrada e saída;
- identificação de jornada noturna;
- cálculo de atraso;
- aplicação de escalas 5x2, 6x1 ou 12x36;
- cálculo de minutos trabalhados.

Explicação sugerida:

### Repositories

Os repositories centralizam consultas compartilhadas feitas com Prisma.

Explicação sugerida:

Nem toda consulta precisa obrigatoriamente estar em um repository. Essa camada é utilizada principalmente quando uma consulta é compartilhada ou possui uma responsabilidade de persistência bem definida.

### Serializers

Os serializers transformam as entidades internas no formato retornado pela API.

Eles ajudam a:

- padronizar respostas;
- ocultar campos internos;
- evitar exposição direta do modelo do banco;
- produzir representações específicas para a API e para a auditoria.

### Types e Utils

Os arquivos de tipos armazenam contratos compartilhados dentro do módulo.

Os utilitários armazenam pequenas operações técnicas relacionadas ao domínio, como manipulação de datas e fusos horários.

## Recursos compartilhados

A pasta `common` contém recursos utilizados por vários módulos:

```text
common/
├── auth/          → autenticação e autorização
├── audit/         → rastreabilidade
├── constants/     → valores e enums do domínio
├── errors/        → erros controlados
├── email/         → envio de mensagens
├── middlewares/   → tratamento global
├── validation/    → integração com Zod
└── utils/         → datas, duração e escopo da empresa
```

Esses recursos são preocupações transversais, pois atendem vários domínios.

## Arquitetura de dados

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

O sistema é multiempresa.

Cada empresa possui seus próprios:

- usuários;
- jornadas;
- feriados;
- registros de ponto;
- solicitações;
- logs de auditoria.

O isolamento é garantido no backend utilizando a empresa associada ao usuário autenticado.

## Exemplo de fluxo: registro de ponto

```text
POST /time-records/register
       ↓
Autenticação
       ↓
Validação do corpo
       ↓
createTimeEntry
       ↓
Validação da sequência
       ↓
Criação do TimeEntry
       ↓
Recálculo do Workday
       ↓
Registro de auditoria
       ↓
Resposta HTTP 201
```

Uma batida não é tratada como um registro isolado.

Depois de criar um `TimeEntry`, o backend recalcula o `Workday`, considerando:

- jornada vigente;
- escala de trabalho;
- feriados;
- fuso horário;
- trabalho noturno;
- horas extras;
- minutos faltantes;
- atrasos;
- consistência da sequência.

## Exemplo de fluxo: aprovação de ajuste

```text
PATCH /adjustment-requests/:id/review
       ↓
Autenticação e autorização
       ↓
Validação da requisição
       ↓
Transação do Prisma
       ↓
Aplicação dos ajustes
       ↓
Validação da sequência final
       ↓
Recálculo da jornada
       ↓
Auditoria
       ↓
Resposta HTTP
```

A transação garante que as alterações sejam aplicadas por completo ou desfeitas.

Registros corrigidos não são apagados. O registro anterior é marcado como `SUPERSEDED` e uma nova versão é criada.

## Segurança

A segurança é aplicada em diferentes níveis:

### Autenticação

O access token identifica o usuário em cada requisição.

### Autorização

O middleware de perfil controla quais funções podem acessar determinada rota.

### Sessões

O refresh token está associado a uma sessão persistida, permitindo:

- logout real;
- revogação;
- expiração;
- encerramento das sessões após troca de senha.

### Isolamento multiempresa

Usuários comuns são limitados à empresa associada à sua autenticação.

O frontend não é considerado uma barreira de segurança.

## Tratamento de erros

O backend possui um middleware global que transforma erros em respostas HTTP padronizadas.

Exemplos:

- `400` para dados inválidos;
- `401` para falha de autenticação;
- `403` para falta de permissão;
- `404` para recursos ou rotas inexistentes;
- `409` para conflitos no banco;
- `500` para falhas inesperadas.

Isso evita a repetição do tratamento de erros em todas as rotas.

## Auditoria

Operações sensíveis geram registros de auditoria.

Os logs podem armazenar:

- usuário responsável;
- empresa;
- entidade modificada;
- ação realizada;
- estado anterior;
- estado posterior;
- campos alterados;
- data e hora.

A auditoria é importante porque o sistema trabalha com informações sensíveis de jornada.

## Testes

A estratégia combina:

- testes unitários para regras puras;
- testes de serviços com dependências mockadas;
- testes HTTP com Supertest;
- testes de middlewares;
- testes de autenticação e autorização.

Essa organização permite testar regras de negócio sem precisar iniciar um servidor ou acessar um banco real em todos os testes.

## Justificativa da arquitetura

Explicação sugerida:

As principais vantagens são:

- arquivos menores;
- responsabilidades claras;
- facilidade para localizar código;
- regras mais testáveis;
- menor acoplamento;
- manutenção mais segura;
- evolução independente dos módulos;
- redução de regras de negócio dentro das rotas.

## Resposta curta para uma apresentação
