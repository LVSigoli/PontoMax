// Types
import type { TableAction } from "@/components/structure/Table/types"
import type { Holiday, HolidayType } from "./types"

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 1,
    name: "FERIADO",
    date: "2026-01-01",
    type: "Nacional",
    status: "Ativo",
  },
  {
    id: 2,
    name: "FERIADO",
    date: "2026-01-01",
    type: "Municipal",
    status: "Ativo",
  },
  {
    id: 3,
    name: "FERIADO",
    date: "2026-01-01",
    type: "Estadual",
    status: "Inativo",
  },
  {
    id: 4,
    name: "FERIADO",
    date: "2026-01-01",
    type: "Nacional",
    status: "Ativo",
  },
]

export const HOLIDAY_TYPE_OPTIONS: Array<{
  value: HolidayType
  label: HolidayType
}> = [
  { value: "Nacional", label: "Nacional" },
  { value: "Municipal", label: "Municipal" },
  { value: "Estadual", label: "Estadual" },
]

export const HOLIDAY_ACTIONS: TableAction[] = [
  {
    id: "edit",
    label: "Editar",
    color: "text-content-secondary",
    icon: <span aria-hidden="true">✎</span>,
  },
  {
    id: "remove",
    label: "Remover",
    color: "text-danger-700",
    icon: <span aria-hidden="true">⌫</span>,
  },
]
