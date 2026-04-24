// External Libraries
import React from "react"

// Assets
import ClockIcon from "@/assets/icons/clock.svg"
import MailIcon from "@/assets/icons/mail.svg"

// Components
import { Button } from "@/components/structure/Button"
import { Icon } from "@/components/structure/Icon"
import { Input } from "@/components/structure/Input"
import { Typography } from "@/components/structure/Typography"

// Hooks
import { useRecoverPassword } from "./hooks"

interface Props {
  onBackToLoginClick?: () => void
}

export const RecoverPasswordForm: React.FC<Props> = ({
  onBackToLoginClick,
}) => {
  // Hooks
  const { credential, handleCredentialChange } = useRecoverPassword()

  // Functions
  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log("recover password", credential)
  }

  return (
    <form
      className="w-full max-w-90"
      aria-labelledby="recover-password-title"
      onSubmit={handleSubmit}
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="relative mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-600 text-content-inverse">
          <Icon src={ClockIcon} size="1.25rem" />
        </div>

        <Typography variant="b1" fontWeight="bold" value="Recuperar senha" />

        <Typography
          variant="b2"
          value="Informe seu e-mail para receber as instruções de recuperação."
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
      </div>

      <Button
        fitWidth
        type="submit"
        value="Enviar instruções"
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
