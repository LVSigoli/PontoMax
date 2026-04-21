// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Contexts
import { useSolicitationsContext } from "../../contexts/SolicitationsContext"

// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type {
  Solicitation,
  SolicitationStatus,
} from "../../types"
import type { SolicitationDrawerMethods } from "../../components/SolicitationDrawer/types"

export function useSolicitations() {
  // Refs
  const drawerRef = useRef<SolicitationDrawerMethods>(null)

  // States
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedElement, setSelectedElement] = useState<Solicitation | null>(
    null
  )
  const [drawerRequestKey, setDrawerRequestKey] = useState(0)

  // Constants
  const { solicitations } = useSolicitationsContext()
  const filteredSolicitations = useMemo(() => {
    return solicitations.filter((solicitation) => {
      const matchesSearch = solicitation.userName
        .toLowerCase()
        .includes(search.trim().toLowerCase())
      const matchesStatus =
        statusFilter === "all" || solicitation.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [search, solicitations, statusFilter])

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

export type { SolicitationStatus }
