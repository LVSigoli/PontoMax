import { describe, expect, it } from "vitest"

import { subDays } from "../../../src/modules/analytics/date-helpers.js"

describe("subDays", () => {
  it("subtracts days in UTC space", () => {
    expect(subDays(new Date("2026-05-11T00:00:00.000Z"), 5).toISOString()).toBe(
      "2026-05-06T00:00:00.000Z",
    )
  })
})
