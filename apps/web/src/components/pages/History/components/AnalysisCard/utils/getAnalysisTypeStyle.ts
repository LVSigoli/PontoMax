import type { IconName } from "@/components/structure/Icon"

import type { UserAnalysisType } from "../../../types"

export function getAnalysisTypeStyle(type: UserAnalysisType) {
  const styles: Record<
    UserAnalysisType,
    {
      icon: IconName
      iconClassName: string
    }
  > = {
    "worked-days": {
      icon: "calendar",
      iconClassName: "bg-brand-600 text-content-inverse",
    },
    "hour-balance": {
      icon: "clock",
      iconClassName: "bg-success-600 text-content-inverse",
    },
    pending: {
      icon: "bookmark",
      iconClassName: "bg-warning-600 text-content-inverse",
    },
    issues: {
      icon: "danger",
      iconClassName: "bg-danger-600 text-content-inverse",
    },
  }

  return styles[type]
}
