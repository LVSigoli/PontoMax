import { useState } from "react"

import { postForgotPassword } from "@/services/auth"
import { getErrorMessage } from "@/utils/getErrorMessage"

const DEFAULT_SUCCESS_MESSAGE =
  "Se o e-mail informado estiver cadastrado, voce recebera um link para redefinir sua senha."

export function useRecoverPassword() {
  const [email, setEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleEmailChange(value: string) {
    setErrorMessage("")
    setSuccessMessage("")
    setEmail(value)
  }

  async function handleSubmit() {
    if (isSubmitting) return

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setErrorMessage("Informe seu e-mail para continuar.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      const response = await postForgotPassword({
        email: normalizedEmail,
      })

      setSuccessMessage(response.message || DEFAULT_SUCCESS_MESSAGE)
      setEmail("")
    } catch (error) {
      setSuccessMessage("")
      setErrorMessage(
        getErrorMessage(
          error,
          "Nao foi possivel solicitar a redefinicao agora. Tente novamente em instantes."
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    email,
    errorMessage,
    successMessage,
    isSubmitting,
    handleEmailChange,
    handleSubmit,
  }
}
