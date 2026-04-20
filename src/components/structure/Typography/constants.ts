import type { ElementType } from "react"

import type { TypographyColor, TypographyVariant } from "./types"

interface VariantConfig {
  className: string
  color: TypographyColor
  element: ElementType
}

export const TYPOGRAPHY_VARIANTS: Record<TypographyVariant, VariantConfig> = {
  h1: {
    element: "h1",
    color: "primary",
    className: "text-5xl font-bold leading-[1.08] tracking-[-0.04em]",
  },
  h2: {
    element: "h2",
    color: "primary",
    className: "text-4xl font-bold leading-[1.12] tracking-[-0.035em]",
  },
  h3: {
    element: "h3",
    color: "primary",
    className: "text-3xl font-bold leading-[1.18] tracking-[-0.03em]",
  },
  h4: {
    element: "h4",
    color: "primary",
    className: "text-2xl font-semibold leading-[1.25] tracking-[-0.02em]",
  },
  b1: {
    element: "p",
    color: "primary",
    className: "text-base font-normal leading-7",
  },
  b2: {
    element: "p",
    color: "secondary",
    className: "text-sm font-normal leading-6",
  },
  b3: {
    element: "p",
    color: "secondary",
    className: "text-xs font-medium leading-5",
  },
  caption: {
    element: "span",
    color: "secondary",
    className: "text-xs font-semibold leading-4 tracking-[0.01em]",
  },
  legal: {
    element: "small",
    color: "secondary",
    className: "text-[0.625rem] font-normal leading-3 tracking-[0.01em]",
  },
}

export const TYPOGRAPHY_COLORS: Record<TypographyColor, string> = {
  primary: "text-content-primary",
  secondary: "text-content-secondary",
  white: "text-content-inverse",
}
