import type { MaskValue } from "../types"
import { applyPattern, onlyDigits } from "../utils"

export const monthYear = (value: MaskValue): string => {
  const digits = onlyDigits(value).slice(0, 6)

  return applyPattern(digits, "##/####")
}
