// External Libraries
import React from "react"

// Components
import { Typography } from "@/components/structure/Typography"

export const Banner: React.FC = () => {
  return (
    <div className="relative hidden h-full overflow-hidden rounded-3xl bg-[url('/images/banner.png')] bg-cover bg-center bg-no-repeat p-10 text-content-inverse lg:block">
      <div className="absolute inset-0 h-full bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.24),transparent_22%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.18),transparent_16%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[#062b62] to-transparent" />

      <div className="relative w-120 z-10  left-4 bottom-4 flex h-full flex-col justify-end">
        <Typography
          variant="h2"
          color="white"
          value="Seu controle de ponto, simples e eficiente"
        />
      </div>
    </div>
  )
}
