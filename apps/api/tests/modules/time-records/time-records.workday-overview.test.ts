import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { resetTimeRecordsMocks, mocked } from "./time-records.test-kit"

const { getWorkdayOverview } = await import(
  "../../../src/modules/time-records/time-records.service.js"
)

beforeEach(() => {
  resetTimeRecordsMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("time records service - getWorkdayOverview", () => {
  it("includes scheduled days without records in the overview", async () => {
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

    const overview = await getWorkdayOverview({
      companyId: 10,
      userId: 7,
      page: 1,
      pageSize: 20,
      timezone: "America/Sao_Paulo",
    })

    expect(overview).toEqual({
      items: [
        {
          id: -new Date("2026-05-14T00:00:00.000Z").getTime(),
          date: "2026-05-14",
          status: "INCONSISTENT",
          scheduledMinutes: 480,
          workedMinutes: 0,
          overtimeMinutes: 0,
          missingMinutes: 480,
          nightMinutes: 0,
          isHoliday: false,
          timeEntries: [],
        },
        {
          id: -new Date("2026-05-13T00:00:00.000Z").getTime(),
          date: "2026-05-13",
          status: "INCONSISTENT",
          scheduledMinutes: 480,
          workedMinutes: 0,
          overtimeMinutes: 0,
          missingMinutes: 480,
          nightMinutes: 0,
          isHoliday: false,
          timeEntries: [],
        },
        {
          id: -new Date("2026-05-12T00:00:00.000Z").getTime(),
          date: "2026-05-12",
          status: "INCONSISTENT",
          scheduledMinutes: 480,
          workedMinutes: 0,
          overtimeMinutes: 0,
          missingMinutes: 480,
          nightMinutes: 0,
          isHoliday: false,
          timeEntries: [],
        },
      ],
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: 3,
        totalPages: 1,
      },
    })
  })

  it("limits the overview to the requested date range", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"))

    mocked.prisma.workday.findMany.mockResolvedValue([])
    mocked.prisma.userJourneyAssignment.findMany.mockResolvedValue([
      {
        id: 100,
        userId: 7,
        validFrom: new Date("2026-05-01T00:00:00.000Z"),
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

    const overview = await getWorkdayOverview({
      companyId: 10,
      from: "2026-05-12",
      to: "2026-05-13",
      userId: 7,
      page: 1,
      pageSize: 20,
      timezone: "America/Sao_Paulo",
    })

    expect(overview).toEqual({
      items: [
        {
          id: -new Date("2026-05-13T00:00:00.000Z").getTime(),
          date: "2026-05-13",
          status: "INCONSISTENT",
          scheduledMinutes: 480,
          workedMinutes: 0,
          overtimeMinutes: 0,
          missingMinutes: 480,
          nightMinutes: 0,
          isHoliday: false,
          timeEntries: [],
        },
        {
          id: -new Date("2026-05-12T00:00:00.000Z").getTime(),
          date: "2026-05-12",
          status: "INCONSISTENT",
          scheduledMinutes: 480,
          workedMinutes: 0,
          overtimeMinutes: 0,
          missingMinutes: 480,
          nightMinutes: 0,
          isHoliday: false,
          timeEntries: [],
        },
      ],
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: 2,
        totalPages: 1,
      },
    })
  })
})
