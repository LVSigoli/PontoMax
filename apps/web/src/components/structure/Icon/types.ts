import type { StaticImageData } from "next/image"

export interface Props {
  src: string | StaticImageData
  size?: string
  alt?: string
  placement?: "start" | "end" | "center"
  onClick?: () => void
}
