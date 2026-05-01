import type { ButtonHTMLAttributes, MouseEventHandler } from "react"

import type { IconName } from "../Icon"

export type ButtonVariant = "filled" | "outlined" | "text"
export type ButtonColor = "brand" | "danger" | "primary"
export type ButtonIconPlacement = "start" | "end" | "left" | "right"

export interface Props extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> {
  value: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  variant?: ButtonVariant
  color?: ButtonColor
  icon?: IconName
  iconPlacement?: ButtonIconPlacement
  loading?: boolean
  fitWidth?: boolean
}
