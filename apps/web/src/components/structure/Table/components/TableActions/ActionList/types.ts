import { TableAction, TableActionState } from "../../../types"

export interface Props {
  actions: TableAction[]
  onActionClick: (id: string) => void
  getActionState?: (id: string) => TableActionState | undefined
  position: {
    left: number
    top: number
  }
}
