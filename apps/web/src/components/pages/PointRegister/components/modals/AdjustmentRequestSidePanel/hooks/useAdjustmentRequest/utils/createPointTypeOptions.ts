import type { SelectionOption } from "@/components/structure/Select/types"

import { POINT_TYPES } from "../../../constants"

export function createPointTypeOptions() {
  return POINT_TYPES.map<SelectionOption>((type) => ({
    value: type,
    label: type,
  }))
}
