import { Icon } from "@/components/structure/Icon"
import { SidebarHeader } from "../../SidebarHeader"

interface Props {
  onClose: () => void
}

export const MobileSidebarPanelHeader: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle px-5 py-5">
      <SidebarHeader className="px-0 py-0" showBorder={false} />

      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className="flex size-9 items-center justify-center rounded-md text-content-secondary transition hover:bg-surface-muted hover:text-content-primary"
      >
        <Icon name="out" size="1rem" layout="inline" className="text-current" />
      </button>
    </div>
  )
}
