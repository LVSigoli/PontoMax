// Components
import { Typography } from "@/components/structure/Typography"

// Types
import type { Props } from "./types"

export const Toggle: React.FC<Props> = ({ label, active, onChange }) => {
  return (
    <label className="flex w-fit cursor-pointer items-center gap-2">
      <Typography variant="b2" value={label} />

      <button
        type="button"
        role="switch"
        aria-checked={active}
        className={`relative h-5 w-10 rounded-full transition ${
          active ? "bg-brand-600" : "bg-border-strong"
        }`}
        onClick={() => onChange(!active)}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-surface-card shadow-sm transition ${
            active ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  )
}
