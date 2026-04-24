import type { MaskValue } from "../types"
import { applyPattern, onlyDigits } from "../utils"

export const date = (value: MaskValue): string => {
  const digits = onlyDigits(value).slice(0, 8)

  return applyPattern(digits, "##/##/####")
}
