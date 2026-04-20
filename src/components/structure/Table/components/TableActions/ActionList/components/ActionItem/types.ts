import { TableAction } from "@/components/structure/Table/types"

export interface Props {
  action: TableAction
  onActionClick: (id: string) => void
}
