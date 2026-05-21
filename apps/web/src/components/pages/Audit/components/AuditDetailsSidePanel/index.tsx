import { forwardRef } from "react"

import { SidePanel } from "@/components/structure/SidePanel"
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import { Typography } from "@/components/structure/Typography"

import {
  buildAuditMetadataText,
  formatAuditDate,
  getAuditActionColor,
  getAuditActionLabel,
  getAuditEntityLabel,
} from "../../utils"
import type { Props } from "./types"

export const AuditDetailsSidePanel = forwardRef<SidePanelMethods, Props>(
  ({ log }, ref) => {
    if (!log) return null

    return (
      <SidePanel
        ref={ref}
        title={`Evento #${log.id}`}
        subtitle={log.summary}
        widthClassName="max-w-2xl"
      >
        <div className="h-full overflow-y-auto px-4 py-5 sm:px-5">
          <div className="grid gap-6">
            <section className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAuditActionColor(log.action)}`}
                >
                  {getAuditActionLabel(log.action)}
                </span>

                <span className="inline-flex rounded-full bg-info-50 px-3 py-1 text-xs font-semibold text-info-700">
                  {getAuditEntityLabel(log.entityType)}
                </span>

                <span className="inline-flex rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-content-primary">
                  ID {log.entityId}
                </span>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Detail label="Data" value={formatAuditDate(log.createdAt)} />
                <Detail label="Empresa" value={log.companyName} />
                <Detail
                  label="Autor"
                  value={log.actorUserName ?? log.actorUserEmail ?? "Sistema"}
                />
                <Detail label="Entidade" value={getAuditEntityLabel(log.entityType)} />
              </dl>
            </section>

            <section className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4">
              <Typography
                variant="b2"
                value="Metadados"
                className="font-semibold"
              />

              <pre className="max-h-[420px] overflow-auto rounded-xl bg-surface-muted p-4 text-xs leading-6 text-content-primary">
                {buildAuditMetadataText(log.metadata) || "Sem metadados estruturados."}
              </pre>
            </section>
          </div>
        </div>
      </SidePanel>
    )
  }
)

AuditDetailsSidePanel.displayName = "AuditDetailsSidePanel"

function Detail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid gap-1">
      <Typography variant="legal" value={label} className="text-content-muted" />
      <Typography variant="b2" value={value} className="font-semibold" />
    </div>
  )
}
