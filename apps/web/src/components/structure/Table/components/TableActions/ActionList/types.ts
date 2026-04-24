import { TableAction } from "../../../types"

export interface Props {
  actions: TableAction[]
  onActionClick: (id: string) => void
  position: {
    left: number
    top: number
  }
}
