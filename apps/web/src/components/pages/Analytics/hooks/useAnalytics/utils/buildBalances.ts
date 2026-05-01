// Services
import { AnalyticsDashboardResponse } from "@/services/domain"
import { formatMinutes } from "@/services/utils"

//  Types
import { EmployeeHourBalance } from "../../../types"

export function buildBalances(
  dashboard: AnalyticsDashboardResponse
): EmployeeHourBalance[] {
  return dashboard.balances.map((item) => {
    return {
      id: item.id,
      name: item.name,
      balance: formatMinutes(item.balanceMinutes),
      status: buildBalanceStatus(item.balanceMinutes),
    }
  })
}

function buildBalanceStatus(balanceMinutes: number) {
  if (balanceMinutes > 0) return "positive"

  if (balanceMinutes < 0) return "negative"

  return "neutral"
}
