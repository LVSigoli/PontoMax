import { createPortal } from "react-dom"

import type { PickerPanelProps } from "../../types"

export const PickerPanel: React.FC<PickerPanelProps> = ({
  children,
  className = "",
  panelRef,
  position,
}) => {
  return createPortal(
    <div
      ref={panelRef}
      className={`fixed w-fit z-70 overflow-hidden rounded-xl border border-border-default bg-surface-overlay shadow-[0_14px_40px_rgba(15,23,42,0.14)] ${className}`}
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
      }}
    >
      {children}
    </div>,
    document.body
  )
}
