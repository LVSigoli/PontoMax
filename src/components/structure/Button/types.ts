import type { ButtonHTMLAttributes, MouseEventHandler } from "react"

export type ButtonVariant = "filled" | "outlined" | "text"
export type ButtonColor = "brand" | "danger"

export interface Props
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick"> {
  value: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  variant?: ButtonVariant
  color?: ButtonColor
  loading?: boolean
  fitWidth?: boolean
}
