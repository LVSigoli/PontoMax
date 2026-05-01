import { SidebarFooter } from "../../SidebarFooter"
import { SidebarNavigation } from "../../SidebarNavigation"
import { MobileSidebarPanelHeader } from "./MobileSidebarPanelHeader"
import type { MobileSidebarPanelProps } from "../types"

export const MobileSidebarPanel: React.FC<MobileSidebarPanelProps> = ({
  isOpen,
  items,
  onClose,
  isItemActive,
  panelRef,
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/35 lg:hidden">
      <aside
        ref={panelRef}
        id="mobile-navigation-panel"
        className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col border-l border-border-subtle bg-surface-card shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
      >
        <MobileSidebarPanelHeader onClose={onClose} />

        <SidebarNavigation
          items={items}
          isItemActive={isItemActive}
          onItemClick={onClose}
          className="flex flex-1 flex-col gap-1 px-4 py-5"
        />

        <SidebarFooter />
      </aside>
    </div>
  )
}
