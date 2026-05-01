// External Libraries
import React from "react"

// Assets
import ClockIcon from "@/assets/icons/clock.svg"
import LockIcon from "@/assets/icons/lock.svg"

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

export const ReplacePasswordForm: React.FC<Props> = ({
  onBackToLoginClick,
}) => {
  const {
    credential,
    errorMessage,
    handleCredentialChange,
    handleConfirmPasswordIconClick,
    handlePasswordIconClick,
    handleSubmit,
    isConfirmPasswordHidden,
    isPasswordHidden,
    isSubmitting,
    successMessage,
  } = useReplacePassword()

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await handleSubmit()
  }

  return (
    <form
      className="w-full max-w-90"
      aria-labelledby="replace-password-title"
      onSubmit={handleFormSubmit}
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="relative mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-600 text-content-inverse ">
          <Icon src={ClockIcon} size="1.25rem" />
        </div>

        <Typography variant="b1" fontWeight="bold" value="Nova senha" />

        <Typography
          variant="b2"
          value="Crie uma nova senha para acessar sua conta com seguranca."
        />
      </div>

      <div className="space-y-4">
        <Input
          title="nova senha"
          icon={LockIcon}
          value={credential.password}
          placeholder="Informe sua nova senha"
          type={isPasswordHidden ? "password" : "text"}
          onIconClick={handlePasswordIconClick}
          onChange={(value) => handleCredentialChange("password", value)}
        />

        <Input
          title="confirmar senha"
          icon={LockIcon}
          value={credential.confirmPassword}
          placeholder="Confirme sua nova senha"
          type={isConfirmPasswordHidden ? "password" : "text"}
          onIconClick={handleConfirmPasswordIconClick}
          onChange={(value) => handleCredentialChange("confirmPassword", value)}
        />
      </div>

      <Button
        fitWidth
        type="submit"
        value="Salvar nova senha"
        className="mt-7"
        loading={isSubmitting}
      />

      {errorMessage ? (
        <Typography
          variant="legal"
          value={errorMessage}
          className="mt-3 text-danger-700"
        />
      ) : null}

      {successMessage ? (
        <Typography
          variant="legal"
          value={successMessage}
          className="mt-3 text-success-700"
        />
      ) : null}

      <Button
        fitWidth
        variant="text"
        value="Voltar para login"
        onClick={onBackToLoginClick}
      />
    </form>
  )
}
