import type { FormEvent } from "react"

export interface Credential {
  email: string
  password: string
}

export interface UseLoginResult {
  credential: Credential
  errorMessage: string
  isSubmitting: boolean
  handleCredentialChange: (key: keyof Credential, value: string) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}
