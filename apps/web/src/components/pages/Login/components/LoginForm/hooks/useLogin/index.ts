// External Libraries
import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/router"

// Contexts
import { useAuth } from "@/contexts/AuthContext"

// Utils
import { makeInitialCredential } from "./utils"

// Types
import { Credential, UseLoginResult } from "./types"

export function useLogin(): UseLoginResult {
  // Hooks
  const router = useRouter()
  const { login } = useAuth()

  // States
  const [credential, setCredential] = useState(makeInitialCredential)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Functions
  function handleCredentialChange(key: keyof Credential, value: string) {
    setErrorMessage("")

    setCredential((currentCredential) => ({
      ...currentCredential,
      [key]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) return

    const email = credential.email.trim().toLowerCase()
    const password = credential.password

    if (!email || !password) {
      setErrorMessage("Preencha e-mail e senha para continuar.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      const response = await login({ email, password })

      if (response.requiresPasswordChange) {
        await router.push({
          pathname: "/login",
          query: {
            view: "replace-password",
            token: response.resetToken,
          },
        })
        return
      }

      await router.push("/")
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel realizar o login.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    credential,
    errorMessage,
    isSubmitting,
    handleCredentialChange,
    handleSubmit,
  }
}
