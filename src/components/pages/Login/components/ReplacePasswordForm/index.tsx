// External Libraries
import React from "react"

// Assets
import ClockIcon from "@/assets/icons/clock.svg"

// Components
import { Button } from "@/components/structure/Button"
import { Icon } from "@/components/structure/Icon"
import { Input } from "@/components/structure/Input"
import { Typography } from "@/components/structure/Typography"

// Hooks
import { useReplacePassword } from "./hooks"

interface Props {
  onBackToLoginClick?: () => void
}

export const ReplacePasswordForm: React.FC<Props> = ({ onBackToLoginClick }) => {
  // Hooks
  const { credential, handleCredentialChange } = useReplacePassword()

  // Functions
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log("replace password", credential)
  }

  return (
    <form
      className="w-full max-w-90"
      aria-labelledby="replace-password-title"
      onSubmit={handleSubmit}
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="relative mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-600 text-content-inverse shadow-[0_10px_24px_rgba(37,99,235,0.28)]">
          <Icon src={ClockIcon} size="1.25rem" />
        </div>

        <Typography variant="b1" fontWeight="bold" value="Nova senha" />

        <Typography
          variant="b2"
          value="Crie uma nova senha para acessar sua conta com segurança."
        />
      </div>

      <div className="space-y-4">
        <Input
          title="nova senha"
          type="password"
          value={credential.password}
          placeholder="Informe sua nova senha"
          onChange={(v) => handleCredentialChange("password", v)}
        />

        <Input
          title="confirmar senha"
          type="password"
          value={credential.confirmPassword}
          placeholder="Confirme sua nova senha"
          onChange={(v) => handleCredentialChange("confirmPassword", v)}
        />
      </div>

      <Button
        fitWidth
        type="submit"
        value="Salvar nova senha"
        className="mt-7"
      />

      <Button
        fitWidth
        variant="text"
        value="Voltar para login"
        onClick={onBackToLoginClick}
      />
    </form>
  )
}
