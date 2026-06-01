import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocked = vi.hoisted(() => {
  return {
    prisma: {
      workday: {
        findUniqueOrThrow: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      userJourneyAssignment: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      holiday: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
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

const {
  createTimeEntry,
  getUserWorkdaySummary,
  getWorkdayOverview,
  recalculateWorkday,
  serializeTimeEntry,
  serializeWorkday,
} = await import("../../../src/modules/time-records/time-records.service.js")

beforeEach(() => {
  mocked.prisma.workday.findUniqueOrThrow.mockReset()
  mocked.prisma.workday.findUnique.mockReset()
  mocked.prisma.workday.findMany.mockReset()
  mocked.prisma.workday.upsert.mockReset()
  mocked.prisma.workday.update.mockReset()
  mocked.prisma.userJourneyAssignment.findFirst.mockReset()
  mocked.prisma.userJourneyAssignment.findMany.mockReset()
  mocked.prisma.holiday.findFirst.mockReset()
  mocked.prisma.holiday.findMany.mockReset()
  mocked.prisma.adjustmentRequest.count.mockReset()
  mocked.prisma.timeEntry.findMany.mockReset()
  mocked.prisma.timeEntry.aggregate.mockReset()
  mocked.prisma.timeEntry.create.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
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

    mocked.prisma.workday.findUniqueOrThrow.mockResolvedValue({
      id: 43,
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
      timeEntries: [entry1, exit1],
    })
    mocked.prisma.userJourneyAssignment.findFirst.mockResolvedValue({
      id: 100,
      userId: 7,
      validFrom: new Date("2026-05-10T00:00:00.000Z"),
      validTo: null,
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
    mocked.prisma.holiday.findFirst.mockResolvedValue(null)
    mocked.prisma.workday.update.mockResolvedValue({
      id: 43,
      date: workdayDate,
      status: "CLOSED",
      scheduledMinutes: 480,
      workedMinutes: 480,
      overtimeMinutes: 0,
      missingMinutes: 0,
      nightMinutes: 420,
      isHoliday: false,
      timeEntries: [entry1, exit1],
    })

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

  it("registers the next expected kind and recalculates the workday", async () => {
    const workdayDate = new Date("2026-05-11T00:00:00.000Z")
    const existingEntry = {
      id: 1,
      kind: "ENTRY",
      recordedAt: new Date("2026-05-11T11:00:00.000Z"),
      status: "ACTIVE",
      timezone: "America/Sao_Paulo",
      sequence: 1,
      source: "WEB",
    }
    const createdEntry = {
      id: 2,
      kind: "EXIT",
      recordedAt: new Date("2026-05-11T17:00:00.000Z"),
      status: "ACTIVE",
      timezone: "America/Sao_Paulo",
      sequence: 2,
      source: "WEB",
    }

    mocked.prisma.userJourneyAssignment.findMany.mockResolvedValue([
      {
        id: 100,
        userId: 7,
        validFrom: new Date("2026-05-01T00:00:00.000Z"),
        validTo: null,
        journey: {
          scaleCode: "5X2",
          dailyWorkMinutes: 360,
          expectedEntryTime: new Date("1970-01-01T08:00:00.000Z"),
          expectedExitTime: new Date("1970-01-01T14:00:00.000Z"),
          flexibleSchedule: false,
          toleranceMinutes: 10,
          nightShift: false,
        },
      },
    ])
    mocked.prisma.userJourneyAssignment.findFirst.mockResolvedValue({
      id: 100,
      userId: 7,
      validFrom: new Date("2026-05-01T00:00:00.000Z"),
      validTo: null,
      journey: {
        scaleCode: "5X2",
        dailyWorkMinutes: 360,
        expectedEntryTime: new Date("1970-01-01T08:00:00.000Z"),
        expectedExitTime: new Date("1970-01-01T14:00:00.000Z"),
        flexibleSchedule: false,
        toleranceMinutes: 10,
        nightShift: false,
      },
    })
    mocked.prisma.holiday.findFirst.mockResolvedValue(null)
    mocked.prisma.workday.upsert.mockResolvedValue({
      id: 42,
      companyId: 10,
      userId: 7,
      date: workdayDate,
    })
    mocked.prisma.timeEntry.findMany.mockResolvedValue([existingEntry])
    mocked.prisma.timeEntry.aggregate.mockResolvedValue({
      _max: {
        sequence: 1,
      },
    })
    mocked.prisma.timeEntry.create.mockResolvedValue(createdEntry)
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
      timeEntries: [existingEntry, createdEntry],
    })
    mocked.prisma.workday.update.mockResolvedValue({
      id: 42,
      date: workdayDate,
      status: "CLOSED",
      scheduledMinutes: 360,
      workedMinutes: 360,
      overtimeMinutes: 0,
      missingMinutes: 0,
      nightMinutes: 0,
      isHoliday: false,
      timeEntries: [existingEntry, createdEntry],
    })

    const result = await createTimeEntry({
      companyId: 10,
      userId: 7,
      recordedAt: new Date("2026-05-11T17:00:00.000Z"),
      source: "WEB",
      timezone: "America/Sao_Paulo",
    })

    expect(result.entry.kind).toBe("EXIT")
    expect(mocked.prisma.timeEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: "EXIT",
          sequence: 2,
        }),
      })
    )
    expect(result.workday).toMatchObject({
      status: "CLOSED",
      workedMinutes: 360,
      nightMinutes: 0,
    })
  })

  it("rejects a new time entry when it overlaps the latest point", async () => {
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
    mocked.prisma.workday.upsert.mockResolvedValue({
      id: 42,
      companyId: 10,
      userId: 7,
      date: new Date("2026-05-11T00:00:00.000Z"),
    })
    mocked.prisma.timeEntry.findMany.mockResolvedValue([
      {
        id: 1,
        kind: "ENTRY",
        recordedAt: new Date("2026-05-11T11:00:00.000Z"),
        status: "ACTIVE",
        timezone: "America/Sao_Paulo",
        sequence: 1,
        source: "WEB",
      },
      {
        id: 2,
        kind: "EXIT",
        recordedAt: new Date("2026-05-11T18:00:00.000Z"),
        status: "ACTIVE",
        timezone: "America/Sao_Paulo",
        sequence: 2,
        source: "WEB",
      },
    ])

    await expect(
      createTimeEntry({
        companyId: 10,
        userId: 7,
        recordedAt: new Date("2026-05-11T17:00:00.000Z"),
        source: "WEB",
        timezone: "America/Sao_Paulo",
      })
    ).rejects.toMatchObject({
      name: "AppError",
      statusCode: 400,
      message: "The new time entry must be later than the latest registered point.",
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
      latitude: -23.55052,
      longitude: -46.633308,
      accuracyMeters: 12.5,
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
          latitude: -23.55052,
          longitude: -46.633308,
          accuracyMeters: 12.5,
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
      location: {
        latitude: -23.55052,
        longitude: -46.633308,
        accuracyMeters: 12.5,
      },
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
