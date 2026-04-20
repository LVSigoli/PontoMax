// External Libraries
import { useState } from "react"

// Utils
import { makeInitialCredential } from "./utils"

// Types
import { Credential } from "./types"

export function useLogin() {
  // States
  const [credential, setCredential] = useState(makeInitialCredential)

  // Functions
  function handleCredentialChange(key: keyof Credential, value: string) {
    setCredential((currentCredential) => ({
      ...currentCredential,
      [key]: value,
    }))
  }

  return { credential, handleCredentialChange }
}
