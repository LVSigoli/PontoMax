export function makeTimeEntry(overrides: Record<string, unknown> = {}) {
  return {
    kind: "ENTRY",
    recordedAt: new Date("2026-05-11T11:00:00.000Z"),
    status: "ACTIVE",
    timezone: "America/Sao_Paulo",
    sequence: 1,
    ...overrides,
  }
}

export function makeWorkday(overrides: Record<string, unknown> = {}) {
  return {
    id: 42,
    userId: 7,
    companyId: 10,
    date: new Date("2026-05-11T00:00:00.000Z"),
    status: "OPEN",
    scheduledMinutes: 0,
    workedMinutes: 0,
    overtimeMinutes: 0,
    missingMinutes: 0,
    nightMinutes: 0,
    isHoliday: false,
    timeEntries: [],
    ...overrides,
  }
}

export function makeJourneyAssignment(overrides: Record<string, unknown> = {}) {
  const { journey, ...rest } = overrides as {
    journey?: Record<string, unknown>
  } & Record<string, unknown>

  return {
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
      ...(journey ?? {}),
    },
    ...rest,
  }
}
