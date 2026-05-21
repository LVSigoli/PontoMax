// External Libraries
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

// Components
import { Button } from "@/components/structure/Button"
import { SidePanel } from "@/components/structure/SidePanel"
import { Table } from "@/components/structure/Table"
import { TextArea } from "@/components/structure/TextArea"

// Contexts
import { useSolicitationsContext } from "../../contexts/SolicitationsContext"

// Types
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { TableRowData } from "@/components/structure/Table/types"
import type { Props, SolicitationDrawerMethods } from "./types"

// Utils
import {
  formatSolicitationDate,
  formatSolicitationTime,
  getPointTypeClass,
} from "../../utils"

type ReviewTimeCellTone = "warning" | "success" | "danger" | "muted"

const REVIEW_TIME_CELL_STYLES: Record<
  ReviewTimeCellTone,
  {
    container: string
    badge: string
    value: string
  }
> = {
  warning: {
    container: "border-warning-200 bg-warning-50",
    badge: "bg-warning-100 text-warning-700",
    value: "text-warning-900",
  },
  success: {
    container: "border-success-200 bg-success-50",
    badge: "bg-success-100 text-success-700",
    value: "text-success-900",
  },
  danger: {
    container: "border-danger-200 bg-danger-50",
    badge: "bg-danger-100 text-danger-700",
    value: "text-danger-900",
  },
  muted: {
    container: "border-border-subtle bg-surface-page",
    badge: "bg-surface-muted text-content-muted",
    value: "text-content-muted",
  },
}

function renderReviewTimeCell(params: {
  heading: string
  value: string
  tone: ReviewTimeCellTone
  emphasized?: boolean
  strikethrough?: boolean
}) {
  const styles = REVIEW_TIME_CELL_STYLES[params.tone]
  const strikeClass = params.strikethrough
    ? params.tone === "danger"
      ? "line-through decoration-2 decoration-danger-400"
      : "line-through decoration-2 decoration-warning-400"
    : ""

  return (
    <span
      className={`inline-flex min-w-28 flex-col gap-0.5 rounded-xl border px-3 py-1 ${styles.container}`}
    >
      <span
        className={`w-fit rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] ${styles.badge}`}
      >
        {params.heading}
      </span>
      <span
        className={`text-sm font-semibold ${params.emphasized ? "tracking-wide" : ""} ${strikeClass} ${styles.value}`}
      >
        {params.value}
      </span>
    </span>
  )
}

function getReviewTimeTone(
  point: {
    actionType?: "CREATE" | "UPDATE" | "DELETE"
    originalRecordedAt?: string
    newRecordedAt?: string
  },
  side: "before" | "after"
): ReviewTimeCellTone {
  if (side === "before") {
    if (point.actionType === "CREATE") return "muted"
    if (point.actionType === "DELETE") return "danger"

    return point.originalRecordedAt ? "warning" : "muted"
  }

  if (point.actionType === "DELETE") return "danger"
  if (point.actionType === "CREATE") return "success"

  return point.newRecordedAt ? "success" : "muted"
}

export const SolicitationDrawer = forwardRef<SolicitationDrawerMethods, Props>(
  ({ element }, ref) => {
    // Refs
    const sidePanelRef = useRef<SidePanelMethods>(null)
    const [pendingDecision, setPendingDecision] = useState<
      "Aprovado" | "Recusado" | null
    >(null)

    // Contexts
    const { updateSolicitationStatus } = useSolicitationsContext()

    const isPending = element?.status === "Pendente"
    const subtitle = element
      ? `${element.userName} - ${formatSolicitationDate(element.requestDate)}`
      : "Revise os registros e a justificativa da solicitacao"

    const tableData =
      element?.points.map<TableRowData>((point) => ({
        Antes: {
          value: renderReviewTimeCell({
            heading: "Original",
            value:
              point.originalRecordedAt && point.actionType !== "CREATE"
                ? formatSolicitationTime(point.originalRecordedAt)
                : "Sem registro",
            tone: getReviewTimeTone(point, "before"),
            emphasized: Boolean(point.originalRecordedAt),
            strikethrough:
              point.actionType === "UPDATE" || point.actionType === "DELETE",
          }),
        },
        Depois: {
          value: renderReviewTimeCell({
            heading: point.actionType === "DELETE" ? "Removido" : "Solicitado",
            value:
              point.actionType === "DELETE"
                ? "Registro excluido"
                : point.newRecordedAt
                  ? formatSolicitationTime(point.newRecordedAt)
                  : "Sem registro",
            tone: getReviewTimeTone(point, "after"),
            emphasized: Boolean(point.newRecordedAt),
          }),
        },
        Tipo: {
          value: point.type,
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

    async function handleApprove() {
      if (!element || !isPending || pendingDecision) return

      try {
        setPendingDecision("Aprovado")
        await updateSolicitationStatus(element.id, "Aprovado")
        handleClose()
      } catch {} finally {
        setPendingDecision(null)
      }
    }

    async function handleRefuse() {
      if (!element || !isPending || pendingDecision) return

      try {
        setPendingDecision("Recusado")
        await updateSolicitationStatus(element.id, "Recusado")
        handleClose()
      } catch {} finally {
        setPendingDecision(null)
      }
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
            disabled={pendingDecision === "Aprovado"}
            loading={pendingDecision === "Recusado"}
            onClick={handleRefuse}
          />

          <Button
            fitWidth
            value="Aprovar"
            disabled={pendingDecision === "Recusado"}
            loading={pendingDecision === "Aprovado"}
            onClick={handleApprove}
          />
        </footer>
      )
    }

    return (
      <SidePanel
        ref={sidePanelRef}
        title="Solicitacao de ajuste"
        subtitle={subtitle}
        className="bg-surface-page"
        widthClassName="max-w-[504px]"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-5">
            <Table
              data={tableData}
              minWidth="100%"
              sideScroll={false}
              className="max-h-80 overflow-y-auto rounded-xl bg-surface-card"
              emptyMessage="Nenhum horario informado"
              getRowKey={(_, index) => element?.points[index]?.id ?? index}
            />

            <TextArea
              disabled
              label="Justificativa"
              value={element?.justification ?? ""}
              onChange={() => undefined}
            />
          </div>

          {renderFooter()}
        </div>
      </SidePanel>
    )
  }
)

SolicitationDrawer.displayName = "SolicitationDrawer"
