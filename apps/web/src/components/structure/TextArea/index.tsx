//External Libraries
import React from "react"

// Components
import { Typography } from "@/components/structure/Typography"

// Types
import { Props } from "./types"

export const TextArea: React.FC<Props> = ({ label, value, onChange }) => {
  return (
    <label className="block">
      <Typography variant="b2" fontWeight={700} value={label} />

      <textarea
        value={value}
        placeholder="Digite sua justificativa..."
        className="mt-2 min-h-32 w-full resize-none rounded-lg border border-border-defaul px-3 py-3 text-sm text-content-primary outline-none transition placeholder:text-content-muteds"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
