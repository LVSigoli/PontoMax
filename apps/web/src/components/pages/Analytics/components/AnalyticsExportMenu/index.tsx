import React, { useEffect, useRef, useState } from "react"

interface Props {
  excelDisabled?: boolean
  excelLoading?: boolean
  pdfDisabled?: boolean
  pdfLoading?: boolean
  onExportExcel: () => void | Promise<void>
  onExportPdf: () => void | Promise<void>
}

export const AnalyticsExportMenu: React.FC<Props> = ({
  excelDisabled = false,
  excelLoading = false,
  pdfDisabled = false,
  pdfLoading = false,
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
    void onExportExcel()
  }

  function handleExportPdfClick() {
    setIsOpen(false)
    void onExportPdf()
  }

  return (
    <div
      ref={containerRef}
      data-pdf-exclude="true"
      className="relative"
    >
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
            disabled={excelDisabled}
            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-content-primary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleExportExcelClick}
          >
            {excelLoading ? "Exportando..." : "Excel"}
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={pdfDisabled}
            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-content-primary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleExportPdfClick}
          >
            {pdfLoading ? "Exportando..." : "PDF"}
          </button>
        </div>
      )}
    </div>
  )
}
