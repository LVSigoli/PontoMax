import type { MaskValue } from "../types"

export const email = (value: MaskValue): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[^a-z0-9._%+\-@]/g, "")
    .replace(/@{2,}/g, "@")
