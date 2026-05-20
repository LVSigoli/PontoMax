import { beforeEach, describe, expect, it, vi } from "vitest"

const mocked = vi.hoisted(() => {
  return {
    prisma: {
      workday: {
        findUniqueOrThrow: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      userJourneyAssignment: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      holiday: {
        findFirst: vi.fn(),
      },
      adjustmentRequest: {
        count: vi.fn(),
      },
      timeEntry: {
        findMany: vi.fn(),
        aggregate: vi.fn(),
        create: vi.fn(),
      },
    },
  }
})

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

const { recalculateWorkday, serializeTimeEntry, serializeWorkday } =
  await import("../../../src/modules/time-records/time-records.service.js")

beforeEach(() => {
  mocked.prisma.workday.findUniqueOrThrow.mockReset()
  mocked.prisma.workday.findUnique.mockReset()
  mocked.prisma.workday.findMany.mockReset()
  mocked.prisma.workday.update.mockReset()
  mocked.prisma.userJourneyAssignment.findFirst.mockReset()
  mocked.prisma.userJourneyAssignment.findMany.mockReset()
  mocked.prisma.holiday.findFirst.mockReset()
  mocked.prisma.adjustmentRequest.count.mockReset()
  mocked.prisma.timeEntry.findMany.mockReset()
  mocked.prisma.timeEntry.aggregate.mockReset()
  mocked.prisma.timeEntry.create.mockReset()
})

describe("time records service", () => {
  it("recalculates a workday using active time entries", async () => {
    const workdayDate = new Date("2026-05-11T00:00:00.000Z")
    const entry1 = {
      kind: "ENTRY",
      recordedAt: new Date("2026-05-11T11:00:00.000Z"),
      status: "ACTIVE",
      timezone: "America/Sao_Paulo",
      sequence: 1,
    }
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

    mocked.prisma.workday.findUniqueOrThrow.mockResolvedValue({
      id: 42,
      userId: 7,
      companyId: 10,
      date: workdayDate,
      status: "OPEN",
      scheduledMinutes: 0,
      workedMinutes: 0,
      overtimeMinutes: 0,
      missingMinutes: 0,
      nightMinutes: 0,
      isHoliday: false,
      timeEntries: [entry1, exit1, entry2, exit2],
    })
    mocked.prisma.userJourneyAssignment.findFirst.mockResolvedValue({
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
    })
    mocked.prisma.holiday.findFirst.mockResolvedValue(null)
    mocked.prisma.workday.update.mockResolvedValue({
      id: 42,
      date: workdayDate,
      status: "CLOSED",
      scheduledMinutes: 480,
      workedMinutes: 480,
      overtimeMinutes: 0,
      missingMinutes: 0,
      nightMinutes: 0,
      isHoliday: false,
      timeEntries: [entry1, exit1, entry2, exit2],
    })

    const result = await recalculateWorkday(42)

    expect(result).toMatchObject({
      id: 42,
      status: "CLOSED",
      scheduledMinutes: 480,
      workedMinutes: 480,
      overtimeMinutes: 0,
      missingMinutes: 0,
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

  it("serializes workdays and entries consistently", () => {
    const serializedEntry = serializeTimeEntry({
      id: 1,
      kind: "ENTRY",
      source: "WEB",
      status: "ACTIVE",
      sequence: 1,
      timezone: "America/Sao_Paulo",
      recordedAt: new Date("2026-05-11T11:00:00.000Z"),
    } as never)

    const serializedWorkday = serializeWorkday({
      id: 42,
      date: new Date("2026-05-11T00:00:00.000Z"),
      status: "CLOSED",
      scheduledMinutes: 480,
      workedMinutes: 480,
      overtimeMinutes: 0,
      missingMinutes: 0,
      nightMinutes: 0,
      isHoliday: false,
      timeEntries: [
        {
          id: 1,
          kind: "ENTRY",
          source: "WEB",
          status: "ACTIVE",
          sequence: 1,
          timezone: "America/Sao_Paulo",
          recordedAt: new Date("2026-05-11T11:00:00.000Z"),
        } as never,
      ],
    })

    expect(serializedEntry).toEqual({
      id: 1,
      kind: "ENTRY",
      source: "WEB",
      status: "ACTIVE",
      sequence: 1,
      timezone: "America/Sao_Paulo",
      recordedAt: new Date("2026-05-11T11:00:00.000Z"),
    })
    expect(serializedWorkday).toEqual({
      id: 42,
      date: "2026-05-11",
      status: "CLOSED",
      scheduledMinutes: 480,
      workedMinutes: 480,
      overtimeMinutes: 0,
      missingMinutes: 0,
      nightMinutes: 0,
      isHoliday: false,
      timeEntries: [serializedEntry],
    })
  })
})
