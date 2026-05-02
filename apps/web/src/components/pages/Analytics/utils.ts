import { IconName } from "@/components/structure/Icon"
import type { AnalyticsMetricType, EmployeeHourBalance } from "./types"

export function getMetricTypeStyle(type: AnalyticsMetricType) {
  const styles: Record<
    AnalyticsMetricType,
    {
      icon: IconName
      iconClassName: string
    }
  > = {
    "extra-hours": {
      icon: "clock",
      iconClassName: "bg-success-600 text-content-inverse",
    },
    issues: {
      icon: "danger",
      iconClassName: "bg-danger-600 text-content-inverse",
    },
    pending: {
      icon: "bookmark",
      iconClassName: "bg-warning-600 text-content-inverse",
    },
    present: {
      icon: "employees",
      iconClassName: "bg-brand-600 text-content-inverse",
    },
  }

  return styles[type]
}

export function getBalanceClass(status: EmployeeHourBalance["status"]) {
  if (status === "positive") return "text-success-700"
  if (status === "negative") return "text-danger-700"

  return "text-brand-700"
}
