import type { ButtonVariant } from "./types"

export const BUTTON_BASE_CLASS =
  "inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold outline-none transition disabled:cursor-not-allowed cursor-pointer disabled:opacity-70"

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  filled:
    "border border-brand-600 bg-brand-600 text-content-inverse shadow-[0_12px_24px_rgba(37,99,235,0.25)] hover:bg-brand-700",
  outlined:
    "border border-brand-600 bg-transparent text-brand-600 hover:bg-brand-50 ",
  text: "border border-transparent bg-transparent px-0 text-brand-600 hover:text-brand-700 ",
}
