// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Contexts
import { useSolicitationsContext } from "../../contexts/SolicitationsContext"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { SolicitationDrawerMethods } from "../../components/SolicitationDrawer/types"
import type { Solicitation } from "../../types"
import type { SolicitationStatusFilter } from "./types"

// Utils
import { filterSolicitations } from "./utils"

export function useSolicitations() {
  // Refs
  const drawerRef = useRef<SolicitationDrawerMethods>(null)

  // States
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<SolicitationStatusFilter>("all")
  const [selectedElement, setSelectedElement] = useState<Solicitation | null>(
    null
  )
  const [drawerRequestKey, setDrawerRequestKey] = useState(0)

  // Constants
  const { solicitations } = useSolicitationsContext()
  const filteredSolicitations = useMemo(
    () => filterSolicitations({ search, solicitations, statusFilter }),
    [search, solicitations, statusFilter]
  )

  // Effects
  useEffect(() => {
    if (!drawerRequestKey) return

    drawerRef.current?.open()
  }, [drawerRequestKey])

  // Functions
  function handleSearchChange(value: string) {
    setSearch(value)
  }

  function handleStatusFilterChange(selection: SelectionOption[]) {
    const selectedValue = selection[0]?.value
    if (!selectedValue) return

    setStatusFilter(selectedValue)
  }

  function handleSolicitationSelect(solicitation: Solicitation) {
    setSelectedElement(solicitation)
    setDrawerRequestKey((currentValue) => currentValue + 1)
  }

  return {
    drawerRef,
    filteredSolicitations,
    search,
    selectedElement,
    statusFilter,
    handleSearchChange,
    handleSolicitationSelect,
    handleStatusFilterChange,
  }
}

export type { SolicitationStatus } from "../../types"
