import Image from "next/image"

const metrics = [
  { value: "4", label: "perfis essenciais" },
  { value: "8+", label: "módulos de gestão" },
  { value: "100%", label: "histórico rastreável" },
]

const modules = [
  "Registro de ponto",
  "Solicitações de ajuste",
  "Jornadas e escalas",
  "Feriados por empresa",
  "Gestão multiempresa",
  "Dashboard gerencial",
]

const safeguards = [
  "Registros não são editados diretamente",
  "Ajustes dependem de aprovação gerencial",
  "Validações evitam duplicidade e sobreposição",
]

export function Home() {
  return (
    <main className="min-h-screen bg-surface-canvas text-content-primary">
      <section className="relative flex min-h-[88vh] overflow-hidden bg-navy-900 text-content-inverse">
        <Image
          src="/telas.png"
          alt="Telas do sistema PontoMax"
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-navy-950/70" />
        <div className="relative z-10 flex w-full flex-col justify-between px-6 py-6 sm:px-10 lg:px-16">
          <header className="flex items-center justify-between gap-4">
            <a href="#" className="text-2xl font-bold tracking-normal">
              PontoMax
            </a>
            <nav className="hidden items-center gap-8 text-sm font-medium text-brand-100 md:flex">
              <a href="#modulos" className="hover:text-content-inverse">
                Módulos
              </a>
              <a href="#confianca" className="hover:text-content-inverse">
                Confiabilidade
              </a>
              <a href="#gestao" className="hover:text-content-inverse">
                Gestão
              </a>
            </nav>
          </header>

          <div className="grid max-w-7xl gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:py-20">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex border border-brand-300/40 bg-brand-600/20 px-3 py-1 text-sm font-semibold text-brand-100">
                Controle de ponto eletrônico para PMEs
              </p>
              <h1 className="text-5xl font-bold leading-tight tracking-normal sm:text-6xl lg:text-7xl">
                PontoMax
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-navy-100 sm:text-xl">
                Registro de jornada simples para colaboradores, gestão robusta
                para empresas e rastreabilidade completa para cada ajuste de
                ponto.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#gestao"
                  className="inline-flex h-12 items-center justify-center gap-2 bg-brand-600 px-6 text-sm font-semibold text-content-inverse transition-colors hover:bg-brand-700"
                >
                  Conhecer solução
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href="#modulos"
                  className="inline-flex h-12 items-center justify-center border border-border-strong bg-surface-overlay/10 px-6 text-sm font-semibold text-content-inverse transition-colors hover:bg-surface-overlay/20"
                >
                  Ver módulos
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="border border-brand-300/30 bg-surface-overlay/10 p-5"
                >
                  <strong className="block text-3xl font-bold text-content-inverse">
                    {metric.value}
                  </strong>
                  <span className="mt-1 block text-sm text-brand-100">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="gestao"
        className="border-b border-border-default bg-surface-card px-6 py-16 sm:px-10 lg:px-16"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-brand-600">
              Visão gerencial
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-content-primary sm:text-4xl">
              Jornada, horas e ajustes em um fluxo claro para a empresa.
            </h2>
          </div>
          <p className="text-lg leading-8 text-content-secondary">
            O PontoMax organiza colaboradores por empresa, aplica jornadas e
            feriados próprios, preserva registros originais e centraliza
            solicitações de correção para análise gerencial.
          </p>
        </div>
      </section>

      <section
        id="modulos"
        className="bg-surface-page px-6 py-16 sm:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-brand-600">
                Módulos
              </p>
              <h2 className="mt-3 text-3xl font-bold text-content-primary">
                Estrutura preparada para o fluxo real de ponto.
              </h2>
            </div>
            <span className="text-sm font-semibold text-content-muted">
              Multiempresa desde a base do domínio
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <article
                key={module}
                className="border border-border-default bg-surface-card p-6"
              >
                <div className="mb-5 flex size-10 items-center justify-center bg-brand-50 text-brand-700">
                  <span aria-hidden="true">✓</span>
                </div>
                <h3 className="text-lg font-bold text-content-primary">
                  {module}
                </h3>
                <p className="mt-3 leading-7 text-content-secondary">
                  Recurso pensado para manter a operação de ponto organizada,
                  auditável e simples de acompanhar.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="confianca"
        className="bg-surface-card px-6 py-16 sm:px-10 lg:px-16"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-brand-600">
              Confiabilidade
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-content-primary sm:text-4xl">
              Correções com aprovação, histórico e integridade.
            </h2>
            <p className="mt-5 text-lg leading-8 text-content-secondary">
              Em vez de editar marcações diretamente, o sistema trabalha com
              solicitações de ajuste. Assim, cada mudança tem justificativa,
              análise e rastro operacional.
            </p>
          </div>

          <div className="border border-border-default bg-surface-muted p-6">
            <div className="grid gap-3">
              {safeguards.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 border border-border-subtle bg-surface-card p-4"
                >
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center bg-success-50 text-sm font-bold text-success-700">
                    ✓
                  </span>
                  <span className="font-medium text-content-secondary">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
