import type { MaskValue } from "../types"
import { onlyDigits } from "../utils"

export const decimal = (value: MaskValue): string => {
  const digits = onlyDigits(value)
  const cents = Number(digits || 0) / 100

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents)
}
