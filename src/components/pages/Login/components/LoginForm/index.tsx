// External Libraries
import React from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Icon } from "@/components/structure/Icon"
import { Input } from "@/components/structure/Input"
import { Typography } from "@/components/structure/Typography"

// Assets
import ClockIcon from "@/assets/icons/clock.svg"

// Hooks
import { useLogin } from "./hooks"

export const LoginForm: React.FC = () => {
  // Hooks
  const { credential, handleCredentialChange } = useLogin()

  return (
    <form className="w-full max-w-90" aria-labelledby="login-title">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="relative mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-600 text-content-inverse shadow-[0_10px_24px_rgba(37,99,235,0.28)]">
          <Icon src={ClockIcon} size="1.25rem" />
        </div>

        <Typography variant="b1" fontWeight="bold" value="PontoMax" />

        <Typography
          variant="b2"
          value="Sistema de Gestão de Ponto Eletrônico"
        />
      </div>

      <div className="space-y-4">
        <Input
          title="email"
          value={credential.email}
          placeholder="seu@email.com.br"
          onChange={(v) => handleCredentialChange("email", v)}
        />

        <Input
          title="senha"
          value={credential.passWord}
          placeholder="Informe sua senha"
          onChange={(v) => handleCredentialChange("password", v)}
        />
      </div>

      <Button
        fitWidth
        variant="text"
        value="Esqueci minha senha"
        onClick={() => console.log}
      />

      <Button
        fitWidth
        type="submit"
        value="Enviar"
        onClick={() => console.log("oi submit")}
      />
    </form>
  )
}
