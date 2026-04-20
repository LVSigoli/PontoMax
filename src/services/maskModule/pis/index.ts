import type { MaskValue } from "../types"
import { applyPattern, onlyDigits } from "../utils"

export const pis = (value: MaskValue): string => {
  const digits = onlyDigits(value).slice(0, 11)

  return applyPattern(digits, "###.#####.##-#")
}
