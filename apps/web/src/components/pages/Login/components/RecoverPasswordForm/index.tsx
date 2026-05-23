// External Libraries
import React from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Icon } from "@/components/structure/Icon"
import { Input } from "@/components/structure/Input"
import { Typography } from "@/components/structure/Typography"

// Hooks
import { useRecoverPassword } from "./hooks/useRecoverPassword"

interface Props {
  onBackToLoginClick?: () => void
}

export const RecoverPasswordForm: React.FC<Props> = ({
  onBackToLoginClick,
}) => {
  const {
    email,
    isSubmitting,
    handleEmailChange,
    handleSubmit,
  } = useRecoverPassword()

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await handleSubmit()
  }

  return (
    <form
      className="w-full max-w-100"
      aria-labelledby="recover-password-title"
      onSubmit={handleFormSubmit}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-600 text-content-inverse">
          <Icon name="clock" size="1.25rem" />
        </div>

        <Typography variant="b1" fontWeight="bold" value="Recuperar senha" />

        <Typography
          variant="b2"
          value="Informe o e-mail da sua conta para receber um link de redefinicao."
        />
      </div>

      <Input
        title="email"
        icon="mail"
        type="email"
        value={email}
        placeholder="seu@email.com.br"
        className="mt-6"
        onChange={handleEmailChange}
      />

      <Button
        fitWidth
        type="submit"
        value="Enviar link de redefinicao"
        className="mt-7"
        loading={isSubmitting}
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
