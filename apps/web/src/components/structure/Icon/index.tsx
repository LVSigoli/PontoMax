// External Libraries
import Image from "next/image"
import React from "react"

// Types
import { Props } from "./types"

export const Icon: React.FC<Props> = ({
  src,
  alt = "",
  size = "1rem",
  placement = "start",
}) => {
  const placementClass = {
    center: "left-1/2 -translate-x-1/2",
    end: "right-3",
    start: "left-3",
  }[placement]

  return (
    <Image
      src={src}
      alt={alt}
      width={16}
      height={16}
      style={{ width: size, height: size }}
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 object-contain text-content-muted ${placementClass}`}
    />
  )
}
