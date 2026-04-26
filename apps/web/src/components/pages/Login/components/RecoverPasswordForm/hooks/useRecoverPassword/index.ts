// External Libraries
import { useState } from "react"

// Services
import { postForgotPassword } from "@/services/auth"
import { getErrorMessage } from "@/services/utils"

// Types
import type { RecoverPasswordCredential } from "./types"

// Utils
import { makeInitialRecoverPasswordCredential } from "./utils"

export function useRecoverPassword() {
  const [credential, setCredential] = useState(
    makeInitialRecoverPasswordCredential
  )
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleCredentialChange(
    key: keyof RecoverPasswordCredential,
    value: string
  ) {
    setErrorMessage("")
    setSuccessMessage("")
    setCredential({ ...credential, [key]: value })
  }

  async function handleSubmit() {
    if (isSubmitting) return

    const email = credential.email.trim().toLowerCase()

    if (!email) {
      setErrorMessage("Informe um e-mail para continuar.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      const response = await postForgotPassword({ email })
      const extraMessage = response.resetToken
        ? ` Token de desenvolvimento: ${response.resetToken}`
        : ""

      setSuccessMessage(`${response.message}${extraMessage}`)
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Nao foi possivel solicitar a recuperacao.")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    credential,
    errorMessage,
    successMessage,
    isSubmitting,
    handleCredentialChange,
    handleSubmit,
  }
}
