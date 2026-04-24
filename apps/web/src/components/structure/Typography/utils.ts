import type { CSSProperties } from "react"

import type { Props } from "./types"

export const getTypographyStyle = ({
  fontSize,
  fontWeight,
  lineHeight,
}: Pick<Props, "fontSize" | "fontWeight" | "lineHeight">): CSSProperties => ({
  fontSize,
  fontWeight,
  lineHeight,
})
