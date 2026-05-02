// External Libraries
import React from "react"

// Components
import { Typography } from "@/components/structure/Typography"

interface Props {
  label: string
  value: string
}

export const InviteField: React.FC<Props> = ({ label, value }) => {
  return (
    <div className="grid gap-1">
      <Typography variant="b2" color="secondary" value={label} />
      <Typography
        variant="b1"
        value={value || "-"}
        className="break-all rounded-lg bg-surface-card px-3 py-2"
      />
    </div>
  )
}
