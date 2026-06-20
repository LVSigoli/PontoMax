import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { resetTimeRecordsMocks, mocked } from "./time-records.test-kit"

const { getUserWorkdaySummary } = await import(
  "../../../src/modules/time-records/time-records.service.js"
)

beforeEach(() => {
  resetTimeRecordsMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("time records service - getUserWorkdaySummary", () => {
  it("counts missing scheduled days in the summary", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-15T12:00:00.000Z"))

    mocked.prisma.workday.findMany.mockResolvedValue([])
    mocked.prisma.userJourneyAssignment.findMany.mockResolvedValue([
      {
        id: 100,
        userId: 7,
        validFrom: new Date("2026-05-12T00:00:00.000Z"),
        validTo: null,
        journey: {
          scaleCode: "5X2",
          dailyWorkMinutes: 480,
          expectedEntryTime: new Date("1970-01-01T08:00:00.000Z"),
          expectedExitTime: new Date("1970-01-01T17:00:00.000Z"),
          flexibleSchedule: false,
          toleranceMinutes: 10,
          nightShift: false,
        },
      },
    ])
    mocked.prisma.holiday.findMany.mockResolvedValue([])
    mocked.prisma.adjustmentRequest.count.mockResolvedValue(0)

    const summary = await getUserWorkdaySummary({
      companyId: 10,
      userId: 7,
      timezone: "America/Sao_Paulo",
    })

    expect(summary).toEqual({
      workedDays: 0,
      balanceMinutes: -1440,
      inconsistentCount: 3,
      pendingAdjustments: 0,
    })
  })
})
