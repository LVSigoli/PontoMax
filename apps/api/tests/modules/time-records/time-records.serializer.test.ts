import { describe, expect, it } from "vitest"

import "./time-records.test-kit"

import {
  serializeTimeEntry,
  serializeWorkday,
} from "../../../src/modules/time-records/time-records.service.js"

describe("time records service - serialization", () => {
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
})
