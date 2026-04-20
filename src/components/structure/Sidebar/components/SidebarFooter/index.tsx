//  External Libraries
import React from "react"

// Components
import { Typography } from "@/components/structure/Typography"

export const SidebarFooter: React.FC = () => {
  return (
    <div className="border-t border-border-subtle px-6 py-5">
      <Typography variant="b3" fontWeight={700} value="Lucas Sigoli" />
    </div>
  )
}
