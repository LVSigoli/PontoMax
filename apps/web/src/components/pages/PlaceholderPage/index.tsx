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

        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <Header label={title} subtitle={subtitle} />

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
