import { useState } from "react"

import { useToastContext } from "@/contexts/ToastContext"
import { postForgotPassword } from "@/services/auth"
import { getErrorMessage } from "@/utils/getErrorMessage"

const DEFAULT_SUCCESS_MESSAGE =
  "Se o e-mail informado estiver cadastrado, voce recebera um link para redefinir sua senha."

export function useRecoverPassword() {
  const { showToast } = useToastContext()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleEmailChange(value: string) {
    setEmail(value)
  }

  async function handleSubmit() {
    if (isSubmitting) return

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      showToast({
        variant: "error",
        message: "Informe seu e-mail para continuar.",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await postForgotPassword({
        email: normalizedEmail,
      })

      showToast({
        variant: "success",
        message: response.message || DEFAULT_SUCCESS_MESSAGE,
      })
      setEmail("")
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(
          error,
          "Nao foi possivel solicitar a redefinicao agora. Tente novamente em instantes."
        ),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    email,
    isSubmitting,
    handleEmailChange,
    handleSubmit,
  }
}
