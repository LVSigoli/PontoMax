// External Libraries
import { useRouter } from "next/router"
import { useState } from "react"

// Contexts
import { useAuth } from "@/contexts/AuthContext"
import { useToastContext } from "@/contexts/ToastContext"
import { getErrorMessage } from "@/utils/getErrorMessage"

// Utils
import { makeInitialCredential } from "./utils"

// Types
import { Credential } from "./types"

export function useLogin() {
  // Hooks
  const router = useRouter()
  const { login } = useAuth()
  const { showToast } = useToastContext()

  // States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPassWordType, setIsPasswordType] = useState(true)
  const [credential, setCredential] = useState(makeInitialCredential)

  // Functions
  function handleCredentialChange(key: keyof Credential, value: string) {
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
      showToast({
        variant: "error",
        message: "Preencha e-mail e senha para continuar.",
      })
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
      showToast({
        variant: "error",
        message: getErrorMessage(
          error,
          "Nao foi possivel realizar login. Verifique suas credenciais e tente novamente."
        ),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    credential,
    isSubmitting,
    isPassWordType,
    handleCredentialChange,
    handleSubmit,
    handleIconClick,
  }
}
