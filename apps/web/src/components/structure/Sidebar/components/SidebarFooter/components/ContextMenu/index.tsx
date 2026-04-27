// External Libraries
import React from "react"

// Types
import { Props } from "./types"

export const ContextMenu: React.FC<Props> = ({ onLogout }) => {
  return (
    <div className="absolute bottom-16 right-4 z-20 min-w-36 rounded-lg border border-border-subtle bg-surface-card p-1 shadow-[0_18px_45px_rgba(15,23,42,0.12)] cursor-pointer">
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium text-danger-700 transition hover:bg-surface-muted"
      >
        Sair
      </button>
    </div>
  )
}
