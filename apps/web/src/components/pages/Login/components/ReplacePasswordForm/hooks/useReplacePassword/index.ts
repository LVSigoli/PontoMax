// External Libraries
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"

// Services
import { postResetPassword } from "@/services/auth"

// Types
import { getErrorMessage } from "@/utils/getErrorMessage"
import type { ReplacePasswordCredential } from "./types"

// Utils
import { makeInitialReplacePasswordCredential } from "./utils"

const LOGIN_REDIRECT_DELAY_MS = 2500
const RESET_PASSWORD_SUCCESS_MESSAGE =
  "Senha atualizada com sucesso. Voce sera redirecionado para o login em instantes."

export function useReplacePassword() {
  const router = useRouter()
  const redirectTimeoutRef = useRef<number | null>(null)

  const [credential, setCredential] = useState(
    makeInitialReplacePasswordCredential
  )
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true)

  useEffect(() => {
    return () => {
      clearRedirectTimeout()
    }
  }, [])

  function handleCredentialChange(
    key: keyof ReplacePasswordCredential,
    value: string
  ) {
    clearRedirectTimeout()
    setErrorMessage("")
    setSuccessMessage("")
    setCredential((currentCredential) => ({
      ...currentCredential,
      [key]: value,
    }))
  }

  function handlePasswordIconClick() {
    setIsPasswordHidden((currentValue) => !currentValue)
  }

  function handleConfirmPasswordIconClick() {
    setIsConfirmPasswordHidden((currentValue) => !currentValue)
  }

  function clearRedirectTimeout() {
    if (redirectTimeoutRef.current === null) return

    window.clearTimeout(redirectTimeoutRef.current)
    redirectTimeoutRef.current = null
  }

  function scheduleLoginRedirect() {
    clearRedirectTimeout()

    redirectTimeoutRef.current = window.setTimeout(() => {
      redirectTimeoutRef.current = null
      void router.replace("/login")
    }, LOGIN_REDIRECT_DELAY_MS)
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
      setSuccessMessage("")

      await postResetPassword({
        token,
        password: credential.password,
      })

      setCredential(makeInitialReplacePasswordCredential())
      setSuccessMessage(RESET_PASSWORD_SUCCESS_MESSAGE)
      scheduleLoginRedirect()
    } catch (error) {
      clearRedirectTimeout()
      setSuccessMessage("")
      setErrorMessage(
        getErrorMessage(
          error,
          "Nao foi possivel atualizar sua senha. Verifique se o link ainda esta valido."
        )
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
