import type { MaskValue } from "../types"
import { onlyDigits } from "../utils"

export const currency = (value: MaskValue): string => {
  const digits = onlyDigits(value)
  const cents = Number(digits || 0) / 100

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents)
}
