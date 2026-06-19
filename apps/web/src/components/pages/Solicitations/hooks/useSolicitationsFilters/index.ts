import { useMemo, useState } from "react"

import type { SelectionOption } from "@/components/structure/Select/types"
import { useAuth } from "@/contexts/AuthContext"
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter"
import { useCompaniesSWR } from "@/hooks/swr"
import type { GetAdjustmentRequestsRequest } from "@/services/domain"

import { SOLICITATION_STATUS_OPTIONS } from "../../constants"
import type { SolicitationStatusFilter } from "../useSolicitations/types"

const ALL_OPTION_VALUE = "__all__"

export function useSolicitationsFilters() {
  const { user } = useAuth()
  const {
    activeRange,
    customFrom,
    customTo,
    isCustomPeriod,
    periodOptions,
    periodSummary,
    selectedPeriod,
    selectedPeriodOption,
    handleCustomFromChange,
    handleCustomToChange,
    handlePeriodChange,
  } = useDateRangeFilter({
    defaultPreset: "last30Days",
  })

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<SolicitationStatusFilter>("Pendente")
  const [selectedCompanyValue, setSelectedCompanyValue] =
    useState(ALL_OPTION_VALUE)

  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN"
  const { data: companies = [], isLoading: isCompaniesLoading } =
    useCompaniesSWR({ enabled: isPlatformAdmin })

  const companyOptions = useMemo<SelectionOption[]>(() => {
    if (!isPlatformAdmin) return []

    return [
      { value: ALL_OPTION_VALUE, label: "Todas as empresas" },
      ...companies.map((company) => ({
        value: String(company.id),
        label: company.tradeName?.trim() || company.name,
      })),
    ]
  }, [companies, isPlatformAdmin])

  const requestParams = useMemo<GetAdjustmentRequestsRequest>(() => {
    const params: GetAdjustmentRequestsRequest = {
      from: activeRange.from,
      to: activeRange.to,
    }

    if (statusFilter === "Pendente") {
      params.status = "PENDING"
    } else if (statusFilter === "Aprovado") {
      params.status = "APPROVED"
    } else if (statusFilter === "Recusado") {
      params.status = "REJECTED"
    }

    if (isPlatformAdmin && selectedCompanyValue !== ALL_OPTION_VALUE) {
      params.companyId = Number(selectedCompanyValue)
    }

    return params
  }, [
    activeRange.from,
    activeRange.to,
    isPlatformAdmin,
    selectedCompanyValue,
    statusFilter,
  ])

  const selectedCompanyOption = useMemo(() => {
    return companyOptions.filter(
      (option) => option.value === selectedCompanyValue
    )
  }, [companyOptions, selectedCompanyValue])

  const selectedStatusOption = useMemo(() => {
    return SOLICITATION_STATUS_OPTIONS.filter(
      (option) => option.value === statusFilter
    )
  }, [statusFilter])

  function handleSearchChange(value: string) {
    setSearch(value)
  }

  function handleStatusFilterChange(selection: SelectionOption[]) {
    const nextStatus = selection[0]?.value

    if (!nextStatus) return

    setStatusFilter(nextStatus as SolicitationStatusFilter)
  }

  function handleCompanyChange(selection: SelectionOption[]) {
    const nextCompany = selection[0]?.value

    if (!nextCompany) return

    setSelectedCompanyValue(nextCompany)
  }

  return {
    companyOptions,
    customFrom,
    customTo,
    isCompaniesLoading,
    isCustomPeriod,
    isPlatformAdmin,
    periodOptions,
    periodSummary,
    requestParams,
    search,
    selectedCompanyOption,
    selectedPeriod,
    selectedPeriodOption,
    selectedStatusOption,
    statusOptions: SOLICITATION_STATUS_OPTIONS,
    statusFilter,
    handleCompanyChange,
    handleCustomFromChange,
    handleCustomToChange,
    handlePeriodChange,
    handleSearchChange,
    handleStatusFilterChange,
  }
}
