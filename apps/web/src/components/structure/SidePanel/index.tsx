// External Libraries
import { forwardRef, useId, useImperativeHandle } from "react"

// Contexts
import { useSidePanelContext } from "@/contexts/SidePanelContext"

// Types
import type { SidePanelMethods, SidePanelProps } from "./types"

export const SidePanel = forwardRef<SidePanelMethods, SidePanelProps>(
  (
    {
      children,
      className = "",
      closeOnBackdropClick = true,
      id,
      widthClassName = "max-w-xl",
    },
    ref
  ) => {
    // Hooks
    const generatedId = useId()
    const sidePanelId = id ?? generatedId
    const { activeSidePanelId, closeSidePanel, openSidePanel } =
      useSidePanelContext()

    const isOpen = activeSidePanelId === sidePanelId

    useImperativeHandle(
      ref,
      () => ({
        close: closeSidePanel,
        open: () => openSidePanel(sidePanelId),
        toggle: () => {
          if (isOpen) {
            closeSidePanel()
            return
          }

          openSidePanel(sidePanelId)
        },
      }),
      [closeSidePanel, isOpen, openSidePanel, sidePanelId]
    )

    if (!isOpen) return null

    return (
      <div
        aria-modal="true"
        className="fixed  inset-0 z-50 flex justify-end bg-navy-950/40 backdrop-blur-[2px]"
        role="dialog"
      >
        <button
          aria-label="Fechar painel lateral"
          className="absolute inset-0 size-full cursor-default"
          type="button"
          onClick={closeOnBackdropClick ? closeSidePanel : undefined}
        />

        <aside
          className={`relative z-10 h-full w-full ${widthClassName} overflow-y-auto border-l border-border-subtle bg-surface-overlay shadow-[-24px_0_80px_rgba(15,23,42,0.18)] ${className}`}
        >
          {children}
        </aside>
      </div>
    )
  }
)

SidePanel.displayName = "SidePanel"
