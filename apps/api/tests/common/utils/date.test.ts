import { describe, expect, it } from "vitest"

import {
  endOfDay,
  getDateOnly,
  minutesToTime,
  parseTimeStringToDate,
  parseTimeToMinutes,
  startOfDay,
} from "../../../src/common/utils/date.js"

describe("date utils", () => {
  it("parses time strings into minutes", () => {
    expect(parseTimeToMinutes("08:30")).toBe(510)
  })

  it("parses time strings into UTC dates", () => {
    expect(parseTimeStringToDate("8:5")?.toISOString()).toBe(
      "1970-01-01T08:05:00.000Z",
    )
    expect(parseTimeStringToDate(null)).toBeNull()
  })

  it("formats minutes back into a clock string", () => {
    expect(minutesToTime(0)).toBe("00:00")
    expect(minutesToTime(485)).toBe("08:05")
  })

  it("keeps plain date strings stable", () => {
    expect(getDateOnly("2026-05-11").toISOString()).toBe(
      "2026-05-11T00:00:00.000Z",
    )
  })

  it("resolves date-only values using the provided timezone", () => {
    expect(
      getDateOnly("2026-05-11T01:30:00.000Z", "America/Sao_Paulo").toISOString(),
    ).toBe("2026-05-10T00:00:00.000Z")
  })

  it("creates local day boundaries", () => {
    expect(startOfDay("2026-05-11T15:00:00.000Z").toISOString()).toBe(
      "2026-05-11T00:00:00.000Z",
    )
    expect(endOfDay("2026-05-11T15:00:00.000Z").toISOString()).toBe(
      "2026-05-11T23:59:59.999Z",
    )
  })
})
