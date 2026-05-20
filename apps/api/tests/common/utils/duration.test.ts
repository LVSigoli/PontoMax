import { describe, expect, it } from "vitest"

import { durationToMilliseconds } from "../../../src/common/utils/duration.js"

describe("durationToMilliseconds", () => {
  it("supports seconds, minutes, hours, and days", () => {
    expect(durationToMilliseconds("5s")).toBe(5_000)
    expect(durationToMilliseconds("15m")).toBe(900_000)
    expect(durationToMilliseconds("2h")).toBe(7_200_000)
    expect(durationToMilliseconds("1d")).toBe(86_400_000)
  })

  it("trims whitespace", () => {
    expect(durationToMilliseconds(" 3h ")).toBe(10_800_000)
  })

  it("rejects unsupported formats", () => {
    expect(() => durationToMilliseconds("45")).toThrow(
      "Unsupported duration format: 45",
    )
  })
})
