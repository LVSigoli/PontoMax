// External Libraries
import React from "react"

// Components
import { Header } from "@/components/structure/Header"
import { Sidebar } from "@/components/structure/Sidebar"
import { Typography } from "@/components/structure/Typography"

// Types
import type { Props } from "./types"

export const PlaceholderPage: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header label={title} subtitle={subtitle} />

          <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-5 py-6 sm:px-8 lg:px-10">
            <div className="grid max-w-md gap-2 rounded-xl border border-border-subtle bg-surface-card p-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
              <Typography variant="h4" value={title} />
              <Typography
                variant="b2"
                value="Esta area ainda esta em construcao."
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
