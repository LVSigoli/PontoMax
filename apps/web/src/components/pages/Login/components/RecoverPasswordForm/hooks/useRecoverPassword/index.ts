// External Libraries
import { useState } from "react"

// Types
import type { RecoverPasswordCredential } from "./types"

// Utils
import { makeInitialRecoverPasswordCredential } from "./utils"

export function useRecoverPassword() {
  // States
  const [credential, setCredential] = useState(
    makeInitialRecoverPasswordCredential
  )

  // Functions
  function handleCredentialChange(
    key: keyof RecoverPasswordCredential,
    value: string
  ) {
    setCredential({ ...credential, [key]: value })
  }

  return { credential, handleCredentialChange }
}
