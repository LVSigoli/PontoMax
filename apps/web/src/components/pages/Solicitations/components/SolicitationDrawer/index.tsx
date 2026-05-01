// External Libraries
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react"

// Components
import { Button } from "@/components/structure/Button"
import { SidePanel } from "@/components/structure/SidePanel"
import { Table } from "@/components/structure/Table"
import { TextArea } from "@/components/structure/TextArea"
import { Typography } from "@/components/structure/Typography"

// Contexts
import { useSolicitationsContext } from "../../contexts/SolicitationsContext"

// Types
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { TableRowData } from "@/components/structure/Table/types"
import type { Props, SolicitationDrawerMethods } from "./types"

// Utils
import { getPointTypeClass } from "../../utils"

export const SolicitationDrawer = forwardRef<SolicitationDrawerMethods, Props>(
  ({ element }, ref) => {
    // Refs
    const sidePanelRef = useRef<SidePanelMethods>(null)

    // Contexts
    const { updateSolicitationStatus } = useSolicitationsContext()

    const isPending = element?.status === "Pendente"

    const tableData =
      element?.points.map<TableRowData>((point) => ({
        Horario: { value: point.time },
        Tipo: {
          value: `• ${point.type}`,
          color: getPointTypeClass(point.type),
        },
      })) ?? []

    const handleClose = useCallback(() => {
      sidePanelRef.current?.close()
    }, [])

    const handleOpen = useCallback(() => {
      sidePanelRef.current?.open()
    }, [])

    const handleToggle = useCallback(() => {
      sidePanelRef.current?.toggle()
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        close: handleClose,
        open: handleOpen,
        toggle: handleToggle,
      }),
      [handleClose, handleOpen, handleToggle]
    )

    function handleApprove() {
      if (!element || !isPending) return

      updateSolicitationStatus(element.id, "Aprovado")
      handleClose()
    }

    function handleRefuse() {
      if (!element || !isPending) return

      updateSolicitationStatus(element.id, "Recusado")
      handleClose()
    }

    function renderFooter() {
      if (!isPending) {
        return (
          <footer className="border-t border-border-subtle bg-surface-page px-4 py-5 sm:px-5">
            <Button
              fitWidth
              value="Fechar"
              color="primary"
              variant="outlined"
              onClick={handleClose}
            />
          </footer>
        )
      }

      return (
        <footer className="grid grid-cols-2 gap-3 border-t border-border-subtle bg-surface-page px-4 py-5 sm:px-5">
          <Button
            fitWidth
            value="Recusar"
            color="danger"
            onClick={handleRefuse}
          />

          <Button fitWidth value="Aprovar" onClick={handleApprove} />
        </footer>
      )
    }

    return (
      <SidePanel
        ref={sidePanelRef}
        widthClassName="max-w-[504px]"
        className="bg-surface-page"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-7 sm:px-5">
            <Typography
              variant="h4"
              value="SOLICITACAO DE AJUSTE"
              className="uppercase tracking-[0.08em]"
            />

            <Table
              data={tableData}
              minWidth="100%"
              sideScroll={false}
              className="mt-5 overflow-hidden rounded-xl bg-surface-card"
              emptyMessage="Nenhum horario informado"
              getRowKey={(_, index) => element?.points[index]?.id ?? index}
            />

            <div className="mt-7">
              <TextArea
                disabled
                label="Justificativa"
                value={element?.justification ?? ""}
                onChange={() => undefined}
              />
            </div>
          </div>

          {renderFooter()}
        </div>
      </SidePanel>
    )
  }
)

SolicitationDrawer.displayName = "SolicitationDrawer"
