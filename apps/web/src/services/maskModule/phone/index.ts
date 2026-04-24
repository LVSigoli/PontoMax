import type { MaskValue } from "../types"
import { applyPattern, onlyDigits } from "../utils"

export const phone = (value: MaskValue): string => {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 10) {
    return applyPattern(digits, "(##) ####-####")
  }

  return applyPattern(digits, "(##) #####-####")
}
