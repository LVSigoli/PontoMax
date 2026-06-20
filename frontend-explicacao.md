# Explicação da Arquitetura do Frontend

O frontend do PontoMax utiliza **Next.js, React e TypeScript**.

Sua organização separa:

- páginas;
- componentes de cada funcionalidade;
- componentes reutilizáveis;
- comunicação com a API;
- estados globais;
- hooks;
- estilos;
- tipos e utilitários.

## Visão geral

```text
Usuário
   ↓
Página do Next.js
   ↓
Componente da funcionalidade
   ↓
Hooks e contextos
   ↓
Services
   ↓
API do backend
```

## Estrutura principal

```text
apps/web/src/
├── pages/
├── components/
│   ├── pages/
│   └── structure/
├── contexts/
├── hooks/
├── services/
├── styles/
├── types/
├── utils/
└── assets/
```

## Pages

A pasta `pages` define as rotas da aplicação.

Exemplos:

```text
pages/login/index.tsx         → tela de login
pages/analytics/index.tsx     → dashboard
pages/history/index.tsx       → histórico de ponto
pages/holidays/index.tsx      → feriados
pages/management/index.tsx    → gestão
pages/solicitations/index.tsx → solicitações
```

As páginas são mantidas simples. Normalmente, elas importam o componente
principal da funcionalidade.

## Components

Os componentes são divididos em dois grupos.

### Componentes de páginas

Ficam em:

```text
components/pages/
```

Cada pasta representa uma área da aplicação:

- Login;
- Analytics;
- History;
- Holidays;
- Management;
- PointRegister;
- Solicitations;
- Audit.

Esses componentes são específicos de cada funcionalidade.

### Componentes estruturais

Ficam em:

```text
components/structure/
```

São componentes reutilizados em várias telas, como:

- Button;
- Input;
- Select;
- Table;
- Modal;
- SidePanel;
- Sidebar;
- Typography;
- Picker;
- Charts.

## Hooks

Os hooks concentram comportamentos reutilizáveis.

Eles podem controlar:

- carregamento de dados;
- filtros;
- formulários;
- tabelas;
- paginação;
- autenticação;
- ações específicas de uma tela.

Alguns hooks ficam próximos da funcionalidade que os utiliza.

Exemplo:

```text
components/pages/History/hooks/
components/pages/Login/hooks/
components/pages/Solicitations/hooks/
```

## Services

A pasta `services` é responsável pela comunicação com o backend.

Os services:

- fazem requisições HTTP;
- enviam dados;
- recebem respostas da API;
- centralizam endpoints;
- evitam chamadas Axios espalhadas pelos componentes.

Fluxo simplificado:

```text
Componente
    ↓
Hook
    ↓
Service
    ↓
API
```

## SWR

O projeto utiliza SWR para carregamento e cache de dados.

O SWR ajuda a:

- armazenar respostas em cache;
- evitar requisições repetidas;
- revalidar informações;
- compartilhar dados entre componentes;
- manter dados anteriores durante novos carregamentos.

A configuração global fica em:

```text
hooks/swr/config.ts
```

## Contextos

Os contextos guardam estados compartilhados por várias partes da aplicação.

```text
contexts/
├── AuthContext/
├── ModalContext/
├── SidePanelContext/
└── ToastContext/
```

### AuthContext

Controla:

- sessão atual;
- usuário autenticado;
- login;
- logout;
- restauração da sessão;
- atualização dos dados do usuário.

### ModalContext

Controla a abertura e o fechamento de modais.

### SidePanelContext

Controla painéis laterais e drawers.

### ToastContext

Exibe mensagens de sucesso, aviso ou erro.

## Configuração global

O arquivo:

```text
pages/_app.tsx
```

envolve toda a aplicação com os providers:

```text
SWRConfig
  └── ToastProvider
       └── AuthProvider
            └── ModalProvider
                 └── SidePanelProvider
                      └── Página atual
```

Isso disponibiliza autenticação, cache, mensagens e painéis em todas as telas.

## Autenticação no frontend

O frontend mantém a sessão do usuário e consulta o backend para confirmar os
dados atuais.

Fluxo básico:

```text
Usuário envia login
       ↓
Service chama a API
       ↓
Tokens e usuário são armazenados
       ↓
AuthContext atualiza a aplicação
       ↓
SWR carrega o usuário atual
       ↓
Telas autorizadas são exibidas
```

O frontend também adapta os menus e páginas de acordo com o perfil do usuário.

É importante destacar que a segurança real continua no backend.

## Estilos

Os estilos globais ficam em:

```text
styles/globals.css
styles/design-system.css
```

O design system concentra:

- cores;
- espaçamentos;
- tamanhos;
- padrões visuais;
- estilos compartilhados.

Isso mantém a identidade visual consistente.

## Types

A pasta `types` possui contratos TypeScript compartilhados.

Ela ajuda a definir:

- usuários;
- sessões;
- respostas da API;
- propriedades de componentes;
- objetos do domínio.

## Utils

A pasta `utils` contém funções auxiliares, como:

- tratamento de mensagens de erro;
- filtros de datas;
- localização;
- conversões de valores.

Essas funções são pequenas e podem ser reutilizadas por diferentes telas.

## Exemplo de fluxo: registro de ponto

```text
Usuário clica para registrar
       ↓
Componente PointRegister
       ↓
Hook prepara os dados
       ↓
Service chama a API
       ↓
Backend registra o ponto
       ↓
SWR atualiza os dados
       ↓
Interface mostra o novo estado
```

## Exemplo de fluxo: dashboard

```text
Página de Analytics
       ↓
Hook solicita os indicadores
       ↓
SWR verifica o cache
       ↓
Service consulta a API
       ↓
Dados são transformados
       ↓
Cards e gráficos são atualizados
```

As principais vantagens são:

- componentes menores;
- reutilização;
- interface consistente;
- lógica separada da parte visual;
- comunicação com a API centralizada;
- manutenção mais simples;
- facilidade para criar novas telas.
