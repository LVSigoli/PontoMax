import type { SolicitationStatus, UserAnalysisType } from "./types"

export const getAnalysisTypeStyle = (type: UserAnalysisType) => {
  const styles: Record<
    UserAnalysisType,
    {
      icon: string
      iconClassName: string
    }
  > = {
    "worked-days": {
      icon: "∞",
      iconClassName: "bg-brand-600 text-content-inverse",
    },
    "hour-balance": {
      icon: "◷",
      iconClassName: "bg-success-600 text-content-inverse",
    },
    pending: {
      icon: "▣",
      iconClassName: "bg-warning-600 text-content-inverse",
    },
    issues: {
      icon: "!",
      iconClassName: "bg-danger-600 text-content-inverse",
    },
  }

  return styles[type]
}

export const getSolicitationStatusClass = (status: SolicitationStatus) => {
  if (status === "Inconsistente") return "bg-warning-50 text-warning-700"
  if (status === "Recusado") return "bg-danger-50 text-danger-700"

  return "bg-success-50 text-success-700"
}
