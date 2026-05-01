// External Libraries
import { useState } from "react"
import { useRouter } from "next/router"

// Services
import { postResetPassword } from "@/services/auth"
import { getErrorMessage } from "@/services/utils"

// Types
import type { ReplacePasswordCredential } from "./types"

// Utils
import { makeInitialReplacePasswordCredential } from "./utils"

export function useReplacePassword() {
  const router = useRouter()

  const [credential, setCredential] = useState(
    makeInitialReplacePasswordCredential
  )
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true)

  function handleCredentialChange(
    key: keyof ReplacePasswordCredential,
    value: string
  ) {
    setErrorMessage("")
    setSuccessMessage("")
    setCredential({ ...credential, [key]: value })
  }

  function handlePasswordIconClick() {
    setIsPasswordHidden((currentValue) => !currentValue)
  }

  function handleConfirmPasswordIconClick() {
    setIsConfirmPasswordHidden((currentValue) => !currentValue)
  }

  async function handleSubmit() {
    if (isSubmitting) return

    const token =
      typeof router.query.token === "string" ? router.query.token.trim() : ""

    if (!token) {
      setErrorMessage("Abra esta tela com o token de redefinicao na URL.")
      return
    }

    if (!credential.password || !credential.confirmPassword) {
      setErrorMessage("Preencha e confirme a nova senha.")
      return
    }

    if (credential.password !== credential.confirmPassword) {
      setErrorMessage("As senhas informadas precisam ser iguais.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      await postResetPassword({
        token,
        password: credential.password,
      })

      setSuccessMessage("Senha atualizada com sucesso. Voce ja pode fazer login.")
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Nao foi possivel atualizar a senha.")
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
    isPasswordHidden,
    isConfirmPasswordHidden,
    handleCredentialChange,
    handleSubmit,
    handlePasswordIconClick,
    handleConfirmPasswordIconClick,
  }
}
