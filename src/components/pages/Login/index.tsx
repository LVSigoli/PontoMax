// External Libraries
import React from "react"

// Components
import { Input } from "@/components/structure/Input"

// Hooks
import { useLogin } from "./hooks"

export const Login: React.FC = () => {
  // Hooks
  const { credential, handleCredentialChange } = useLogin()

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-5 py-8 text-content-primary">
      <section className="grid w-full max-w-480 overflow-hidden rounded-sm bg-surface-card shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:min-h-160 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative hidden min-h-160 overflow-hidden bg-linear-to-br from-[#2f80ed] via-[#2563eb] to-[#0f3a7b] p-10 text-content-inverse lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.24),transparent_22%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.18),transparent_16%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[#062b62] to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-end">
            <h1 className="max-w-117.5 text-4xl font-bold leading-tight tracking-[-0.03em]">
              Seu controle de ponto, simples e eficiente.
            </h1>
          </div>
        </div>

        <div className="flex min-h-[620px] items-center justify-center bg-[#f8fafc] px-6 py-12 sm:px-10 lg:px-16">
          <form className="w-full max-w-[360px]" aria-labelledby="login-title">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-600 text-content-inverse shadow-[0_10px_24px_rgba(37,99,235,0.28)]"></div>
              <h2
                id="login-title"
                className="text-2xl font-bold tracking-tight"
              >
                PontoMax
              </h2>
              <p className="mt-2 text-sm text-content-secondary">
                Sistema de Gestão de Ponto Eletrônico
              </p>
            </div>

            <div className="space-y-4">
              <Input
                title="E-mail"
                value={credential.email}
                placeholder="seu@email.com.br"
                onChange={(v) => handleCredentialChange("email", v)}
              />

              <Input
                title="Senha"
                value={credential.passWord}
                placeholder="Informe sua senha"
                onChange={(v) => handleCredentialChange("password", v)}
              />
            </div>

            <a
              href="#"
              className="mt-5 inline-flex text-sm font-semibold text-brand-600 transition hover:text-brand-700"
            >
              Esqueci minha senha
            </a>

            <button
              type="submit"
              className="mt-7 flex h-11 w-full items-center justify-center rounded-md bg-brand-600 text-sm font-semibold text-content-inverse shadow-[0_12px_24px_rgba(37,99,235,0.25)] transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200"
            >
              Entrar
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
