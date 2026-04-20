import type { MaskValue } from "../types"
import { onlyDigits } from "../utils"

export const year = (value: MaskValue): string => onlyDigits(value).slice(0, 4)
