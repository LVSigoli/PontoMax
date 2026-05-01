import type { SVGProps } from "react"

import type { IconName } from "./generated"

export interface Props extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName
  size?: string | number
  layout?: "absolute" | "inline"
  placement?: "start" | "end" | "center"
  positionClassName?: string
}
