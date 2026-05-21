import type {
  TableAction,
  TableActionState,
} from "@/components/structure/Table/types"

export interface Props {
  action: TableAction
  state?: TableActionState
  onActionClick: (id: string) => void
}
