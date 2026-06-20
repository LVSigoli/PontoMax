import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  makeJourneyAssignment,
  makeTimeEntry,
  makeWorkday,
} from "./time-records.fixtures"
import { mocked, resetTimeRecordsMocks } from "./time-records.test-kit"

const { recalculateWorkday } = await import(
  "../../../src/modules/time-records/time-records.service.js"
)

beforeEach(() => {
  resetTimeRecordsMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("time records service - recalculateWorkday", () => {
  it("recalculates a workday using active time entries", async () => {
    const workdayDate = new Date("2026-05-11T00:00:00.000Z")
    const entry1 = makeTimeEntry({
      recordedAt: new Date("2026-05-11T11:00:00.000Z"),
      sequence: 1,
    })
    const exit1 = {
      kind: "EXIT",
      recordedAt: new Date("2026-05-11T15:00:00.000Z"),
      status: "ACTIVE",
      timezone: "America/Sao_Paulo",
      sequence: 2,
    }
    const entry2 = {
      kind: "ENTRY",
      recordedAt: new Date("2026-05-11T16:00:00.000Z"),
      status: "ACTIVE",
      timezone: "America/Sao_Paulo",
      sequence: 3,
    }
    const exit2 = {
      kind: "EXIT",
      recordedAt: new Date("2026-05-11T20:00:00.000Z"),
      status: "ACTIVE",
      timezone: "America/Sao_Paulo",
      sequence: 4,
    }

    mocked.prisma.workday.findUniqueOrThrow.mockResolvedValue(
      makeWorkday({
        date: workdayDate,
        status: "OPEN",
        timeEntries: [entry1, exit1, entry2, exit2],
      })
    )
    mocked.prisma.userJourneyAssignment.findFirst.mockResolvedValue(
      makeJourneyAssignment({
        validFrom: new Date("2026-05-01T00:00:00.000Z"),
      })
    )
    mocked.prisma.holiday.findFirst.mockResolvedValue(null)
    mocked.prisma.workday.update.mockResolvedValue(
      makeWorkday({
        id: 42,
        date: workdayDate,
        status: "CLOSED",
        scheduledMinutes: 480,
        workedMinutes: 480,
        overtimeMinutes: 0,
        missingMinutes: 0,
        nightMinutes: 0,
        timeEntries: [entry1, exit1, entry2, exit2],
      })
    )

    const result = await recalculateWorkday(42)

    expect(result).toMatchObject({
      id: 42,
      status: "CLOSED",
      scheduledMinutes: 480,
      workedMinutes: 480,
      overtimeMinutes: 0,
      missingMinutes: 0,
      nightMinutes: 0,
      isHoliday: false,
    })
    expect(mocked.prisma.workday.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        holidayId: null,
        isHoliday: false,
        scheduledMinutes: 480,
        workedMinutes: 480,
        overtimeMinutes: 0,
        missingMinutes: 0,
        nightMinutes: 0,
        status: "CLOSED",
      },
      include: {
        timeEntries: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            recordedAt: "asc",
          },
        },
      },
    })
  })

  it("counts night minutes for overnight workdays", async () => {
    const workdayDate = new Date("2026-05-10T00:00:00.000Z")
    const entry1 = {
      kind: "ENTRY",
      recordedAt: new Date("2026-05-11T01:00:00.000Z"),
      status: "ACTIVE",
      timezone: "America/Sao_Paulo",
      sequence: 1,
      source: "WEB",
    }
    const exit1 = {
      kind: "EXIT",
      recordedAt: new Date("2026-05-11T09:00:00.000Z"),
      status: "ACTIVE",
      timezone: "America/Sao_Paulo",
      sequence: 2,
      source: "WEB",
    }

    mocked.prisma.workday.findUniqueOrThrow.mockResolvedValue(
      makeWorkday({
        id: 43,
        date: workdayDate,
        status: "OPEN",
        timeEntries: [entry1, exit1],
      })
    )
    mocked.prisma.userJourneyAssignment.findFirst.mockResolvedValue(
      makeJourneyAssignment({
        validFrom: new Date("2026-05-10T00:00:00.000Z"),
        journey: {
          scaleCode: "12X36",
          dailyWorkMinutes: 480,
          expectedEntryTime: new Date("1970-01-01T22:00:00.000Z"),
          expectedExitTime: new Date("1970-01-01T06:00:00.000Z"),
          flexibleSchedule: false,
          toleranceMinutes: 10,
          nightShift: true,
        },
      })
    )
    mocked.prisma.holiday.findFirst.mockResolvedValue(null)
    mocked.prisma.workday.update.mockResolvedValue(
      makeWorkday({
        id: 43,
        date: workdayDate,
        status: "CLOSED",
        scheduledMinutes: 480,
        workedMinutes: 480,
        overtimeMinutes: 0,
        missingMinutes: 0,
        nightMinutes: 420,
        timeEntries: [entry1, exit1],
      })
    )

    const result = await recalculateWorkday(43)

    expect(result).toMatchObject({
      id: 43,
      status: "CLOSED",
      workedMinutes: 480,
      nightMinutes: 420,
    })
    expect(mocked.prisma.workday.update).toHaveBeenCalledWith({
      where: { id: 43 },
      data: {
        holidayId: null,
        isHoliday: false,
        scheduledMinutes: 480,
        workedMinutes: 480,
        overtimeMinutes: 0,
        missingMinutes: 0,
        nightMinutes: 420,
        status: "CLOSED",
      },
      include: {
        timeEntries: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            recordedAt: "asc",
          },
        },
      },
    })
  })
})
