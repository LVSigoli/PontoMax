import type { MaskValue } from "../types"
import { applyPattern, onlyDigits } from "../utils"

export const rg = (value: MaskValue): string => {
  const digits = onlyDigits(value).slice(0, 9)

  return applyPattern(digits, "##.###.###-#")
}
