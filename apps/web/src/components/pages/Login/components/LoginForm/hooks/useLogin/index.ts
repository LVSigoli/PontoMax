// External Libraries
import { useRouter } from "next/router"
import type { FormEvent } from "react"
import { useState } from "react"

// Contexts
import { useAuth } from "@/contexts/AuthContext"

// Utils
import { makeInitialCredential } from "./utils"

// Types
import { Credential } from "./types"

export function useLogin() {
  // Hooks
  const router = useRouter()
  const { login } = useAuth()

  // States
  const [credential, setCredential] = useState(makeInitialCredential)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPassWordType, setIsPasswordType] = useState(true)

  // Functions
  function handleCredentialChange(key: keyof Credential, value: string) {
    setErrorMessage("")

    setCredential((currentCredential) => ({
      ...currentCredential,
      [key]: value,
    }))
  }

  function handleIconClick() {
    setIsPasswordType((prev) => !prev)
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
        error instanceof Error
          ? error.message
          : "Nao foi possivel realizar o login."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    credential,
    errorMessage,
    isSubmitting,
    isPassWordType,
    handleCredentialChange,
    handleSubmit,
    handleIconClick,
  }
}
