import { describe, expect, it } from "vitest"

import { calculateWorkedMinutes } from "../../../src/common/utils/time-records.js"

describe("calculateWorkedMinutes", () => {
  it("sums entry and exit pairs in chronological order", () => {
    const minutes = calculateWorkedMinutes([
      { kind: "EXIT", recordedAt: new Date("2026-05-11T17:00:00.000Z") },
      { kind: "ENTRY", recordedAt: new Date("2026-05-11T08:00:00.000Z") },
      { kind: "EXIT", recordedAt: new Date("2026-05-11T12:00:00.000Z") },
      { kind: "ENTRY", recordedAt: new Date("2026-05-11T13:00:00.000Z") },
    ])

    expect(minutes).toBe(480)
  })

  it("ignores unmatched exits and open entries", () => {
    const minutes = calculateWorkedMinutes([
      { kind: "EXIT", recordedAt: new Date("2026-05-11T07:00:00.000Z") },
      { kind: "ENTRY", recordedAt: new Date("2026-05-11T08:00:00.000Z") },
      { kind: "ENTRY", recordedAt: new Date("2026-05-11T09:00:00.000Z") },
    ])

    expect(minutes).toBe(0)
  })
})
