import type { ButtonColor, ButtonVariant } from "./types"

export const BUTTON_BASE_CLASS =
  "inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold outline-none transition disabled:cursor-not-allowed cursor-pointer disabled:opacity-70"

export const BUTTON_VARIANTS: Record<
  ButtonColor,
  Record<ButtonVariant, string>
> = {
  brand: {
    filled:
      "border border-brand-600 bg-brand-600 text-content-inverse shadow-[0_12px_24px_rgba(37,99,235,0.25)] hover:bg-brand-700",
    outlined:
      "border border-brand-600 bg-transparent text-brand-600 hover:bg-brand-50",
    text: "border border-transparent bg-transparent px-0 text-brand-600 hover:text-brand-700",
  },
  danger: {
    filled:
      "border border-danger-600 bg-danger-600 text-content-inverse shadow-[0_12px_24px_rgba(220,38,38,0.22)] hover:bg-danger-700",
    outlined:
      "border border-danger-600 bg-transparent text-danger-700 hover:bg-danger-50",
    text: "border border-transparent bg-transparent px-0 text-danger-700 hover:text-danger-600",
  },
  primary: {
    filled:
      "border border-content-primary bg-content-primary text-content-inverse shadow-[0_12px_24px_rgba(17,24,39,0.18)] hover:bg-navy-800",
    outlined:
      "border border-content-primary bg-transparent text-content-primary hover:bg-surface-muted",
    text: "border border-transparent bg-transparent px-0 text-content-primary hover:text-content-secondary",
  },
}
