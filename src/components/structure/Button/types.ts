import type { ButtonHTMLAttributes, MouseEventHandler } from "react"

export type ButtonVariant = "filled" | "outlined" | "text"

export interface Props
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick"> {
  value: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  variant?: ButtonVariant
  loading?: boolean
  fitWidth?: boolean
}
