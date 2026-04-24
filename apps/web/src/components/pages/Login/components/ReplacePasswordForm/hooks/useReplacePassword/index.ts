// External Libraries
import { useState } from "react"

// Types
import type { ReplacePasswordCredential } from "./types"

// Utils
import { makeInitialReplacePasswordCredential } from "./utils"

export function useReplacePassword() {
  // States
  const [credential, setCredential] = useState(
    makeInitialReplacePasswordCredential
  )

  // Functions
  function handleCredentialChange(
    key: keyof ReplacePasswordCredential,
    value: string
  ) {
    setCredential({ ...credential, [key]: value })
  }

  return { credential, handleCredentialChange }
}
