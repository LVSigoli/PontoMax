import type { MaskValue } from "./types"

export const onlyDigits = (value: MaskValue): string =>
  String(value ?? "").replace(/\D/g, "")

export const applyPattern = (digits: string, pattern: string): string => {
  let digitIndex = 0

  return pattern
    .split("")
    .map((char) => {
      if (char !== "#") return char

      const digit = digits[digitIndex]
      digitIndex += 1

      return digit ?? ""
    })
    .join("")
    .replace(/\D+$/g, "")
}
