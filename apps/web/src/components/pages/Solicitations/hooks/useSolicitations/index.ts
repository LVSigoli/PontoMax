// External Libraries
import { useEffect, useMemo, useRef, useState } from "react"

// Contexts
import { useSolicitationsContext } from "../../contexts/SolicitationsContext"

// Types
import type { SolicitationDrawerMethods } from "../../components/SolicitationDrawer/types"
import type { Solicitation } from "../../types"

// Utils
import { filterSolicitations } from "./utils"

interface Params {
  search: string
}

export function useSolicitations({ search }: Params) {
  // Refs
  const drawerRef = useRef<SolicitationDrawerMethods>(null)

  // States
  const [selectedElement, setSelectedElement] = useState<Solicitation | null>(
    null
  )
  const [drawerRequestKey, setDrawerRequestKey] = useState(0)

  // Constants
  const { isLoading, solicitations } = useSolicitationsContext()
  const filteredSolicitations = useMemo(
    () => filterSolicitations({ search, solicitations }),
    [search, solicitations]
  )

  // Effects
  useEffect(() => {
    if (!drawerRequestKey) return

    drawerRef.current?.open()
  }, [drawerRequestKey])

  // Functions
  function handleSolicitationSelect(solicitation: Solicitation) {
    setSelectedElement(solicitation)
    setDrawerRequestKey((currentValue) => currentValue + 1)
  }

  return {
    drawerRef,
    filteredSolicitations,
    isLoading,
    selectedElement,
    handleSolicitationSelect,
  }
}

export type { SolicitationStatus } from "../../types"
