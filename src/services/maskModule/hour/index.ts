import type { MaskValue } from "../types"
import { applyPattern, onlyDigits } from "../utils"

export const hour = (value: MaskValue): string => {
  const digits = onlyDigits(value).slice(0, 4)

  return applyPattern(digits, "##:##")
}
