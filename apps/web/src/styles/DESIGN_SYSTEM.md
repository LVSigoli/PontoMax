# Design System

Tokens criados para Tailwind v4 com base nas telas da aplicação Ponto Max.

## Fontes

- `font-sans`: Inter, Roboto, Segoe UI, system UI e fallbacks nativos.
- `font-mono`: JetBrains Mono, Fira Code, SFMono e Consolas.

## Cores Principais

- `brand`: azul de ação primária.
  - `bg-brand-600`, `text-brand-600`, `border-brand-600`
  - Hover recomendado: `hover:bg-brand-700`
- `navy`: azul acinzentado para sidebar, navegação e texto forte.
  - `bg-navy-800`, `text-navy-700`, `border-navy-200`

## Superfícies

- `bg-surface-canvas`: fundo geral da aplicação.
- `bg-surface-page`: fundo de áreas internas.
- `bg-surface-card`: cards, tabelas e painéis.
- `bg-surface-muted`: linhas alternadas, abas inativas e estados leves.
- `bg-surface-overlay`: modais, drawers e popovers.

## Texto

- `text-content-primary`: títulos e valores principais.
- `text-content-secondary`: descrições, labels e textos auxiliares.
- `text-content-muted`: placeholders, timestamps e metadados.
- `text-content-inverse`: texto sobre fundos escuros.

## Bordas

- `border-border-subtle`: divisões muito leves.
- `border-border-default`: borda padrão de cards, inputs e tabelas.
- `border-border-strong`: borda com mais contraste.
- `border-border-focus`: foco de inputs e elementos interativos.
- `border-border-success`: feedback positivo.
- `border-border-warning`: pendências e alertas.
- `border-border-danger`: erro, rejeição e exclusão.

## Estados

- `success`: verde para autorizado, aprovado e presente.
- `warning`: amarelo para pendente, atraso ou atenção.
- `danger`: vermelho para ausência, erro, rejeição ou exclusão.
- `info`: azul para informações e ações neutras.

Exemplos:

```tsx
<button className="bg-brand-600 text-content-inverse hover:bg-brand-700">
  Registrar ponto
</button>

<div className="border border-border-default bg-surface-card text-content-primary">
  Conteúdo
</div>

<span className="bg-success-50 text-success-700">Presente</span>
```
