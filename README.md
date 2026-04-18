# PontoMax

PontoMax é uma aplicação web para registro e gestão de ponto eletrônico em pequenas e médias empresas. O sistema foi pensado para reduzir controles manuais, melhorar a confiabilidade dos registros e oferecer uma visão gerencial clara sobre jornadas, horas extras, feriados, escalas e solicitações de ajuste.

## Objetivo

O produto atende empresas que precisam controlar a jornada de seus colaboradores de forma simples, confiável e flexível. A experiência principal deve ser rápida para o funcionário registrar ponto e robusta para gestores acompanharem inconsistências, solicitações e indicadores operacionais.

## Contexto De Domínio

O PontoMax é multiempresa. Um cliente contratante pode possuir uma ou mais empresas no sistema, e cada empresa mantém seus próprios usuários, jornadas, feriados e registros.

Perfis principais:

- Funcionário: registra ponto, consulta histórico e solicita ajustes.
- Gerente: analisa solicitações de ajuste, aprovando ou recusando correções.
- Cliente: representa o contratante do serviço e pode agrupar múltiplas empresas.

## Regras De Negócio

- Uma empresa pode possuir vários usuários.
- Um usuário pertence a apenas uma empresa.
- Um usuário segue uma jornada.
- Uma jornada pode estar associada a vários usuários.
- Uma empresa pode possuir vários feriados cadastrados.
- Um usuário pode registrar vários pontos.
- Um usuário pode criar várias solicitações de ajuste.
- Usuários gerenciais podem analisar solicitações de ajuste.
- Registros de ponto não devem ser editados diretamente.
- Alterações devem ocorrer apenas via solicitação de ajuste.
- Feriados e dias não úteis podem impactar o cálculo de horas extras.
- O sistema deve preservar integridade, auditoria e histórico das operações.

## Módulos

- Autenticação e recuperação de senha.
- Gestão de clientes.
- Gestão de empresas.
- Gestão de usuários.
- Configuração de jornadas.
- Configuração de feriados.
- Registro de ponto.
- Histórico de jornada.
- Solicitação e análise de ajustes.
- Dashboard com indicadores gerenciais.

## Entidades Principais

- Cliente
- Empresa
- Usuário
- Jornada
- Feriado
- Registro de Ponto
- Solicitação de Ajuste
- Ajuste de Ponto

## Arquitetura De Pastas

```text
src/
  api/                 lógica interna de backend e domínio
  assets/              recursos estáticos internos
  components/
    pages/             componentes de página
    structure/         layout, navegação e estrutura da aplicação
  hooks/               hooks globais
  pages/               rotas do Pages Router do Next.js
    api/               rotas HTTP de backend do Next.js
  services/            consumo de rotas e integrações
  styles/              estilos globais e design system
  utils/               utilitários globais
```

## Design System

O projeto usa Tailwind CSS v4 com tokens declarados em `src/styles/design-system.css`.

Principais famílias de tokens:

- `brand`: ações primárias e foco.
- `navy`: navegação, sidebar e textos fortes.
- `surface`: fundos de página, cards, overlays e áreas neutras.
- `content`: textos primários, secundários, discretos e inversos.
- `border`: bordas sutis, padrão, fortes e semânticas.
- `success`, `warning`, `danger`, `info`: estados operacionais.

Exemplo:

```tsx
<button className="bg-brand-600 text-content-inverse hover:bg-brand-700">
  Registrar ponto
</button>
```

## Scripts

```bash
pnpm run dev
pnpm run build
pnpm run lint
pnpm run typecheck
pnpm run format
pnpm run format:check
```

## Diretrizes Técnicas

- Priorizar simplicidade e clareza de domínio.
- Separar responsabilidades sem excesso de abstração.
- Manter nomes consistentes com o negócio de ponto eletrônico.
- Preservar rastreabilidade em ajustes de ponto.
- Evitar edição direta de registros já criados.
- Favorecer código legível, testável e adequado para evolução acadêmica e prática.
