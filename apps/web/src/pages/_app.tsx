// Types
import type { AppProps } from "next/app"

// Contexts
import { ModalProvider } from "@/contexts/ModalContext"
import { SidePanelProvider } from "@/contexts/SidePanelContext"

// Styles
import { AuthProvider } from "@/contexts/AuthContext"
import "@/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ModalProvider>
        <SidePanelProvider>
          <Component {...pageProps} />
        </SidePanelProvider>
      </ModalProvider>
    </AuthProvider>
  )
}
