import type { CSSProperties, ElementType } from "react"

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "b1"
  | "b2"
  | "b3"
  | "caption"
  | "legal"

export type TypographyColor = "primary" | "secondary" | "white"

export interface Props {
  variant?: TypographyVariant
  as?: ElementType
  value: string
  color?: TypographyColor
  fontSize?: CSSProperties["fontSize"]
  fontWeight?: CSSProperties["fontWeight"]
  lineHeight?: CSSProperties["lineHeight"]
  className?: string
}
