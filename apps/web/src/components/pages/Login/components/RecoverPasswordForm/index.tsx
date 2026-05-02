// External Libraries
import React from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Icon } from "@/components/structure/Icon"
import { Typography } from "@/components/structure/Typography"

interface Props {
  onBackToLoginClick?: () => void
}

export const RecoverPasswordForm: React.FC<Props> = ({
  onBackToLoginClick,
}) => {
  return (
    <div className="w-full max-w-100" aria-labelledby="recover-password-title">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-600 text-content-inverse">
          <Icon name="clock" size="1.25rem" />
        </div>

        <Typography variant="b1" fontWeight="bold" value="Recuperar senha" />

        <Typography
          variant="b2"
          value="Entre em contato com um administrador da sua empresa."
        />

        <Typography
          variant="b2"
          value="O administrador poderá gerar um novo link de redefinição"
        />
      </div>

      <Button
        fitWidth
        variant="text"
        value="Voltar para login"
        onClick={onBackToLoginClick}
      />
    </div>
  )
}
