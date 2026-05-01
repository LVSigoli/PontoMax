import { Typography } from "@/components/structure/Typography"
import { getUserInitials } from "./utils"

interface Props {
  name: string
  subtitle: string
}

export const CustomerIdentification: React.FC<Props> = ({ name, subtitle }) => {
  const initials = getUserInitials(name)

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-[3px] border-content-primary text-[0.75rem] font-semibold leading-none text-content-primary">
        {initials}
      </div>

      <div className="w-full flex flex-col gap-1">
        <Typography
          variant="b2"
          fontWeight={700}
          lineHeight="100%"
          value={name}
          className="truncate text-lg leading-6 text-content-primary"
        />
        <Typography
          variant="b2"
          lineHeight="100%"
          value={subtitle}
          className="truncate text-content-muted"
        />
      </div>
    </div>
  )
}
