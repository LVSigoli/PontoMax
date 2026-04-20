import type { MaskValue } from "../types"
import { applyPattern, onlyDigits } from "../utils"

export const cnpj = (value: MaskValue): string => {
  const digits = onlyDigits(value).slice(0, 14)

  return applyPattern(digits, "##.###.###/####-##")
}
