import React, { useEffect, useRef, useState } from "react"

interface Props {
  onExportExcel: () => void
  onExportPdf: () => void
}

export const AnalyticsExportMenu: React.FC<Props> = ({
  onExportExcel,
  onExportPdf,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  function handleToggle() {
    setIsOpen((currentValue) => !currentValue)
  }

  function handleExportExcelClick() {
    setIsOpen(false)
    onExportExcel()
  }

  function handleExportPdfClick() {
    setIsOpen(false)
    onExportPdf()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-4 text-sm font-semibold text-content-primary shadow-[0_14px_35px_rgba(15,23,42,0.06)] transition hover:bg-surface-muted"
        onClick={handleToggle}
      >
        Exportar
        <span
          aria-hidden="true"
          className={`inline-block size-2 rotate-45 border-b-2 border-r-2 border-content-muted transition ${
            isOpen ? "-translate-y-[1px] rotate-225" : "-translate-y-[2px]"
          }`}
        />
      </button>

      {!isOpen ? null : (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 min-w-36 rounded-xl border border-border-subtle bg-surface-card p-1 shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-content-primary transition hover:bg-surface-muted"
            onClick={handleExportExcelClick}
          >
            Excel
          </button>

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-content-primary transition hover:bg-surface-muted"
            onClick={handleExportPdfClick}
          >
            PDF
          </button>
        </div>
      )}
    </div>
  )
}
