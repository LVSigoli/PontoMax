// External Libraries
import { useRouter } from "next/router"
import { useState } from "react"

// Contexts
import { useAuth } from "@/contexts/AuthContext"

// Utils
import { makeInitialCredential } from "./utils"

// Types
import { useToastContext } from "@/contexts/ToastContext"
import { Credential } from "./types"

export function useLogin() {
  // Hooks
  const router = useRouter()
  const { login } = useAuth()
  const { showToast } = useToastContext()

  // States
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPassWordType, setIsPasswordType] = useState(true)
  const [credential, setCredential] = useState(makeInitialCredential)

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

  async function handleSubmit() {
    if (isSubmitting) return

    const email = credential.email.trim().toLowerCase()
    const password = credential.password

    if (!email || !password) {
      setErrorMessage("Preencha e-mail e senha para continuar.")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await login({ email, password })

      if (!response) return

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
      console.log(error)
      showToast({ variant: "error", message: "Erro ao realizar login" })
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
