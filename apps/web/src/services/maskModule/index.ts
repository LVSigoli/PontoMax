// Utils
import { cep } from "./cep"
import { cnpj } from "./cnpj"
import { cpf } from "./cpf"
import { cpfCnpj } from "./cpfCnpj"
import { currency } from "./currency"
import { date } from "./date"
import { decimal } from "./decimal"
import { email } from "./email"
import { hour } from "./hour"
import { monthYear } from "./monthYear"
import { phone } from "./phone"
import { pis } from "./pis"
import { rg } from "./rg"
import { onlyDigits } from "./utils"
import { year } from "./year"

export const MASK = {
  rg,
  cep,
  cpf,
  pis,
  date,
  hour,
  year,
  cnpj,
  email,
  phone,
  cpfCnpj,
  decimal,
  currency,
  monthYear,
  onlyDigits,
}

export type MaskModule = typeof MASK
export type MaskName = keyof MaskModule
