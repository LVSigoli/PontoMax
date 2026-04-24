import type { MaskValue } from "../types"
import { cnpj } from "../cnpj"
import { cpf } from "../cpf"
import { onlyDigits } from "../utils"

export const cpfCnpj = (value: MaskValue): string => {
  const digits = onlyDigits(value)

  return digits.length > 11 ? cnpj(digits) : cpf(digits)
}
