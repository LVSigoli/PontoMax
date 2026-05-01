// External Libraries
import React from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Icon } from "@/components/structure/Icon"
import { Input } from "@/components/structure/Input"
import { Typography } from "@/components/structure/Typography"

// Assets
import ClockIcon from "@/assets/icons/clock.svg"
import LockIcon from "@/assets/icons/lock.svg"
import MailIcon from "@/assets/icons/mail.svg"

// Hooks
import { useLogin } from "./hooks"

// Types
import { Props } from "./types"

export const LoginForm: React.FC<Props> = ({ onForgotPasswordClick }) => {
  // Hooks
  const {
    credential,
    isSubmitting,
    errorMessage,
    isPassWordType,
    handleSubmit,
    handleIconClick,
    handleCredentialChange,
  } = useLogin()

  return (
    <form
      className="w-full max-w-90"
      aria-labelledby="login-title"
      onSubmit={handleSubmit}
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="relative mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-600 text-content-inverse">
          <Icon src={ClockIcon} size="1.25rem" />
        </div>

        <Typography variant="b1" fontWeight="bold" value="PontoMax" />

        <Typography
          variant="b2"
          value="Sistema de Gestao de Ponto Eletronico"
        />
      </div>

      <div className="space-y-4">
        <Input
          title="email"
          icon={MailIcon}
          value={credential.email}
          placeholder="seu@email.com.br"
          onChange={(v) => handleCredentialChange("email", v)}
        />

        <Input
          title="senha"
          icon={LockIcon}
          value={credential.password}
          placeholder="Informe sua senha"
          onIconClick={handleIconClick}
          type={isPassWordType ? "password" : "text"}
          onChange={(v) => handleCredentialChange("password", v)}
        />
      </div>

      {errorMessage ? (
        <Typography
          className="mt-3 text-center text-feedback-negative"
          variant="caption"
          value={errorMessage}
        />
      ) : null}

      <Button
        fitWidth
        variant="text"
        value="Esqueci minha senha"
        onClick={onForgotPasswordClick}
      />

      <Button
        fitWidth
        type="submit"
        value={isSubmitting ? "Entrando..." : "Entrar"}
        loading={isSubmitting}
      />
    </form>
  )
}
