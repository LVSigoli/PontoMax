import { beforeEach, describe, expect, it } from "vitest"

import { makeJourneyAssignment, makeWorkday } from "./time-records.fixtures"
import { mocked, resetTimeRecordsMocks } from "./time-records.test-kit"

const { createTimeEntry } = await import(
  "../../../src/modules/time-records/time-records.service.js"
)

beforeEach(() => {
  resetTimeRecordsMocks()
})

describe("time records service - createTimeEntry", () => {
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
      makeJourneyAssignment({
        validFrom: new Date("2026-05-01T00:00:00.000Z"),
        journey: {
          scaleCode: "5X2",
          dailyWorkMinutes: 360,
          expectedEntryTime: new Date("1970-01-01T08:00:00.000Z"),
          expectedExitTime: new Date("1970-01-01T14:00:00.000Z"),
          flexibleSchedule: false,
          toleranceMinutes: 10,
          nightShift: false,
        },
      }),
    ])
    mocked.prisma.userJourneyAssignment.findFirst.mockResolvedValue(
      makeJourneyAssignment({
        validFrom: new Date("2026-05-01T00:00:00.000Z"),
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
    )
    mocked.prisma.holiday.findFirst.mockResolvedValue(null)
    mocked.prisma.workday.upsert.mockResolvedValue(
      makeWorkday({
        id: 42,
        companyId: 10,
        userId: 7,
        date: workdayDate,
      })
    )
    mocked.prisma.timeEntry.findMany.mockResolvedValue([existingEntry])
    mocked.prisma.timeEntry.aggregate.mockResolvedValue({
      _max: {
        sequence: 1,
      },
    })
    mocked.prisma.timeEntry.create.mockResolvedValue(createdEntry)
    mocked.prisma.workday.findUniqueOrThrow.mockResolvedValue(
      makeWorkday({
        id: 42,
        userId: 7,
        companyId: 10,
        date: workdayDate,
        status: "OPEN",
        timeEntries: [existingEntry, createdEntry],
      })
    )
    mocked.prisma.workday.update.mockResolvedValue(
      makeWorkday({
        id: 42,
        date: workdayDate,
        status: "CLOSED",
        scheduledMinutes: 360,
        workedMinutes: 360,
        overtimeMinutes: 0,
        missingMinutes: 0,
        nightMinutes: 0,
        timeEntries: [existingEntry, createdEntry],
      })
    )

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
      makeJourneyAssignment({
        validFrom: new Date("2026-05-01T00:00:00.000Z"),
        journey: {
          scaleCode: "5X2",
          dailyWorkMinutes: 480,
          expectedEntryTime: new Date("1970-01-01T08:00:00.000Z"),
          expectedExitTime: new Date("1970-01-01T17:00:00.000Z"),
          flexibleSchedule: false,
          toleranceMinutes: 10,
          nightShift: false,
        },
      }),
    ])
    mocked.prisma.userJourneyAssignment.findFirst.mockResolvedValue(
      makeJourneyAssignment({
        validFrom: new Date("2026-05-01T00:00:00.000Z"),
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
    )
    mocked.prisma.holiday.findFirst.mockResolvedValue(null)
    mocked.prisma.workday.upsert.mockResolvedValue(
      makeWorkday({
        id: 42,
        companyId: 10,
        userId: 7,
        date: new Date("2026-05-11T00:00:00.000Z"),
      })
    )
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
      message:
        "The new time entry must be later than the latest registered point.",
    })
  })
})
