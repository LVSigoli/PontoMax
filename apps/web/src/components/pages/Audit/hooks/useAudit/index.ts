import { useEffect, useMemo, useRef, useState } from "react"

import { useAuth } from "@/contexts/AuthContext"
import {
  useAuditLogsSWR,
  useCompaniesSWR,
  useUsersSWR,
} from "@/hooks/swr"
import type { SidePanelMethods } from "@/components/structure/SidePanel/types"
import type { SelectionOption } from "@/components/structure/Select/types"
import type { TableRowData } from "@/components/structure/Table/types"
import type { AuditLogApiItem } from "@/services/domain"

import {
  ALL_OPTION_VALUE,
  ALL_ACTORS_LABEL,
  ALL_COMPANIES_LABEL,
  AUDIT_ACTION_OPTIONS,
  AUDIT_ENTITY_OPTIONS,
  AUDIT_PAGE_SIZE_OPTIONS,
  buildAuditTableData,
  getAuditRowId,
} from "../../utils"

type AuditFilterValue = string

export function useAudit() {
  const { user } = useAuth()
  const detailsSidePanelRef = useRef<SidePanelMethods>(null)

  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"
  const isCompanyAdmin = user?.role === "COMPANY_ADMIN"

  const [selectedCompanyValue, setSelectedCompanyValue] = useState<AuditFilterValue>(
    isPlatformAdmin ? ALL_OPTION_VALUE : String(user?.companyId ?? ALL_OPTION_VALUE)
  )
  const [selectedActorValue, setSelectedActorValue] =
    useState<AuditFilterValue>(ALL_OPTION_VALUE)
  const [selectedEntityValue, setSelectedEntityValue] =
    useState<AuditFilterValue>(ALL_OPTION_VALUE)
  const [selectedActionValue, setSelectedActionValue] =
    useState<AuditFilterValue>(ALL_OPTION_VALUE)
  const [selectedEntityId, setSelectedEntityId] = useState("")
  const [selectedFrom, setSelectedFrom] = useState(
    buildDateInputValue(addDays(new Date(), -29))
  )
  const [selectedTo, setSelectedTo] = useState(
    buildDateInputValue(new Date())
  )
  const [selectedPageSize, setSelectedPageSize] = useState<AuditFilterValue>("20")
  const [selectedPage, setSelectedPage] = useState(1)
  const [selectedAuditLog, setSelectedAuditLog] =
    useState<AuditLogApiItem | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const selectedCompanyId =
    selectedCompanyValue === ALL_OPTION_VALUE
      ? undefined
      : Number(selectedCompanyValue)
  const selectedActorId =
    selectedActorValue === ALL_OPTION_VALUE
      ? undefined
      : Number(selectedActorValue)
  const selectedEntityType =
    selectedEntityValue === ALL_OPTION_VALUE ? undefined : selectedEntityValue
  const selectedAction =
    selectedActionValue === ALL_OPTION_VALUE ? undefined : selectedActionValue
  const selectedPageSizeNumber = Number(selectedPageSize)

  const { data: companies = [] } = useCompaniesSWR({
    enabled: Boolean(isPlatformAdmin),
  })

  const shouldLoadUsers = Boolean(selectedCompanyId) || isCompanyAdmin
  const { data: companyUsers = [] } = useUsersSWR(
    { companyId: selectedCompanyId },
    {
      enabled: shouldLoadUsers,
    }
  )

  const { data: auditResponse, error, isLoading, mutate } = useAuditLogsSWR(
    {
      companyId: selectedCompanyId,
      actorUserId: selectedActorId,
      entityType: selectedEntityType,
      action: selectedAction,
      entityId: selectedEntityId.trim() || undefined,
      from: selectedFrom || undefined,
      to: selectedTo || undefined,
      page: selectedPage,
      pageSize: selectedPageSizeNumber,
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  )

  const auditLogs = auditResponse?.items ?? []
  const meta =
    auditResponse?.meta ??
    ({
      page: selectedPage,
      pageSize: selectedPageSizeNumber,
      totalItems: 0,
      totalPages: 0,
    } as const)

  const tableData = useMemo(() => buildAuditTableData(auditLogs), [auditLogs])

  const companyOptions = useMemo<SelectionOption[]>(() => {
    if (!isPlatformAdmin) return []

    return [
      { value: ALL_OPTION_VALUE, label: ALL_COMPANIES_LABEL },
      ...companies.map((company) => ({
        value: String(company.id),
        label: company.tradeName?.trim() || company.name,
      })),
    ]
  }, [companies, isPlatformAdmin])

  const selectedCompanyOption = useMemo<SelectionOption[]>(() => {
    if (!isPlatformAdmin) return []

    return companyOptions.filter(
      (option) => option.value === selectedCompanyValue
    )
  }, [companyOptions, isPlatformAdmin, selectedCompanyValue])

  const canShowActorFilter =
    !isPlatformAdmin || selectedCompanyId !== undefined

  const actorOptions = useMemo<SelectionOption[]>(() => {
    if (!canShowActorFilter) return []

    return [
      { value: ALL_OPTION_VALUE, label: ALL_ACTORS_LABEL },
      ...companyUsers.map((companyUser) => ({
        value: String(companyUser.id),
        label: buildUserLabel(companyUser.fullName, companyUser.position),
      })),
    ]
  }, [canShowActorFilter, companyUsers])

  const selectedActorOption = useMemo<SelectionOption[]>(() => {
    if (!canShowActorFilter) return []

    return actorOptions.filter((option) => option.value === selectedActorValue)
  }, [actorOptions, canShowActorFilter, selectedActorValue])

  const entityOptions = AUDIT_ENTITY_OPTIONS
  const selectedEntityOption = useMemo<SelectionOption[]>(() => {
    return entityOptions.filter((option) => option.value === selectedEntityValue)
  }, [entityOptions, selectedEntityValue])

  const actionOptions = AUDIT_ACTION_OPTIONS
  const selectedActionOption = useMemo<SelectionOption[]>(() => {
    return actionOptions.filter((option) => option.value === selectedActionValue)
  }, [actionOptions, selectedActionValue])

  const pageSizeOptions = AUDIT_PAGE_SIZE_OPTIONS
  const selectedPageSizeOption = useMemo<SelectionOption[]>(() => {
    return pageSizeOptions.filter(
      (option) => option.value === selectedPageSize
    )
  }, [pageSizeOptions, selectedPageSize])

  const auditSubtitle = isPlatformAdmin
    ? "Consulte eventos criticos, acessos e mudancas por empresa."
    : "Acompanhe a trilha de eventos da sua empresa."

  useEffect(() => {
    if (!canShowActorFilter) {
      if (selectedActorValue !== ALL_OPTION_VALUE) {
        setSelectedActorValue(ALL_OPTION_VALUE)
      }

      return
    }

    const hasSelectedActor = actorOptions.some(
      (option) => option.value === selectedActorValue
    )

    if (!hasSelectedActor) {
      setSelectedActorValue(ALL_OPTION_VALUE)
    }
  }, [actorOptions, canShowActorFilter, selectedActorValue])

  function closeDetailsPanel() {
    detailsSidePanelRef.current?.close()
  }

  function clearSelectedAuditLog() {
    setSelectedAuditLog(null)
  }

  function handleCompanyChange(selection: SelectionOption[]) {
    const next = selection[0]
    if (!next) return

    setSelectedCompanyValue(next.value)
    setSelectedActorValue(ALL_OPTION_VALUE)
    setSelectedPage(1)
    clearSelectedAuditLog()
    closeDetailsPanel()
  }

  function handleActorChange(selection: SelectionOption[]) {
    const next = selection[0]
    if (!next) return

    setSelectedActorValue(next.value)
    setSelectedPage(1)
    clearSelectedAuditLog()
    closeDetailsPanel()
  }

  function handleEntityTypeChange(selection: SelectionOption[]) {
    const next = selection[0]
    if (!next) return

    setSelectedEntityValue(next.value)
    setSelectedPage(1)
    clearSelectedAuditLog()
    closeDetailsPanel()
  }

  function handleActionChange(selection: SelectionOption[]) {
    const next = selection[0]
    if (!next) return

    setSelectedActionValue(next.value)
    setSelectedPage(1)
    clearSelectedAuditLog()
    closeDetailsPanel()
  }

  function handlePageSizeChange(selection: SelectionOption[]) {
    const next = selection[0]
    if (!next) return

    setSelectedPageSize(next.value)
    setSelectedPage(1)
    clearSelectedAuditLog()
    closeDetailsPanel()
  }

  function handleDateChange(
    setter: (value: string) => void,
    value: string
  ) {
    setter(value)
    setSelectedPage(1)
    clearSelectedAuditLog()
    closeDetailsPanel()
  }

  function handleFromDateChange(value: string) {
    handleDateChange(setSelectedFrom, value)
  }

  function handleToDateChange(value: string) {
    handleDateChange(setSelectedTo, value)
  }

  function handleEntityIdChange(value: string) {
    setSelectedEntityId(value)
    setSelectedPage(1)
    clearSelectedAuditLog()
    closeDetailsPanel()
  }

  function handlePreviousPage() {
    if (selectedPage <= 1) return

    setSelectedPage((currentPage) => currentPage - 1)
    clearSelectedAuditLog()
    closeDetailsPanel()
  }

  function handleNextPage() {
    if (meta.totalPages > 0 && selectedPage >= meta.totalPages) return

    setSelectedPage((currentPage) => currentPage + 1)
    clearSelectedAuditLog()
    closeDetailsPanel()
  }

  function handleAuditRowSelect(row: TableRowData) {
    const rowId = getAuditRowId(row)
    if (Number.isNaN(rowId)) return

    const auditLog = auditLogs.find((item) => item.id === rowId)
    if (!auditLog) return

    setSelectedAuditLog(auditLog)
    detailsSidePanelRef.current?.open()
  }

  async function handleRefreshAuditLogs() {
    if (isRefreshing) return

    try {
      setIsRefreshing(true)
      await mutate()
    } finally {
      setIsRefreshing(false)
    }
  }

  return {
    actionOptions,
    actorOptions,
    auditLogs,
    auditSubtitle,
    clearSelectedAuditLog,
    companyOptions,
    detailsSidePanelRef,
    entityOptions,
    error,
    handleActionChange,
    handleActorChange,
    handleAuditRowSelect,
    handleCompanyChange,
    handleEntityIdChange,
    handleEntityTypeChange,
    handleFromDateChange,
    handleNextPage,
    handlePageSizeChange,
    handlePreviousPage,
    handleRefreshAuditLogs,
    handleToDateChange,
    isLoading,
    isRefreshing,
    meta,
    pageSizeOptions,
    selectedActionOption,
    selectedActorOption,
    selectedAuditLog,
    selectedCompanyId,
    selectedCompanyOption,
    selectedEntityOption,
    selectedEntityValue,
    selectedActionValue,
    selectedEntityId,
    selectedFrom,
    selectedPage,
    selectedPageSizeOption,
    selectedTo,
    tableData,
  }
}

function buildUserLabel(fullName: string, position: string | null) {
  if (position?.trim()) {
    return `${fullName} - ${position.trim()}`
  }

  return fullName
}

function buildDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}
