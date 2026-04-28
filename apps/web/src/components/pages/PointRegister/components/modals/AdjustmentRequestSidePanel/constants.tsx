import { TableAction } from "@/components/structure/Table/types"
import { PointRecord } from "../../../types"

export const POINT_TYPES: PointRecord["type"][] = ["Entrada", "Saida"]

export const ADJUSTMENT_ACTIONS: TableAction[] = [
  {
    id: "remove",
    label: "Remover",
    color: "text-danger-700",
    icon: <span className="text-sm leading-none">x</span>,
  },
]
