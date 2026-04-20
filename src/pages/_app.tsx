// Types
import type { AppProps } from "next/app"

// Contexts
import { ModalProvider } from "@/contexts/ModalContext"

// Styles
import "@/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ModalProvider>
      <Component {...pageProps} />
    </ModalProvider>
  )
}
