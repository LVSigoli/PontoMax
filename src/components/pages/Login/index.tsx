// External Libraries
import React from "react"

// Components
import { Banner } from "./components/Banner"
import { LoginForm } from "./components/LoginForm"
import { RecoverPasswordForm } from "./components/RecoverPasswordForm"
import { ReplacePasswordForm } from "./components/ReplacePasswordForm"
import { useLoginPage } from "./hooks/useLoginPage"

export const Login: React.FC = () => {
  // Hooks
  const { view, handleForgotPasswordClick, handleLoginClick } = useLoginPage()

  // Functions
  function renderForm() {
    if (view === "forgot-password") {
      return <RecoverPasswordForm onBackToLoginClick={handleLoginClick} />
    }

    if (view === "replace-password") {
      return <ReplacePasswordForm onBackToLoginClick={handleLoginClick} />
    }

    return <LoginForm onForgotPasswordClick={handleForgotPasswordClick} />
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] p-5 text-content-primary">
      <section className="grid h-[calc(100vh-2.5rem)] w-full overflow-hidden rounded-sm bg-surface-card lg:grid-cols-[1fr_1fr]">
        <Banner />

        <div className="flex h-full items-center justify-center bg-[#f8fafc] px-6 py-12 sm:px-10 lg:px-16">
          {renderForm()}
        </div>
      </section>
    </main>
  )
}
