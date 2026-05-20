import { describe, expect, it } from "vitest"

import {
  toTimeEntryKind,
  toUserRole,
} from "../../../src/common/constants/domain-enums.js"

describe("domain-enums", () => {
  it("accepts current and legacy user roles", () => {
    expect(toUserRole("EMPLOYEE")).toBe("EMPLOYEE")
    expect(toUserRole("CLIENT_ADMIN")).toBe("COMPANY_ADMIN")
    expect(toUserRole("MANAGER")).toBe("COMPANY_ADMIN")
  })

  it("rejects invalid user roles", () => {
    expect(() => toUserRole("OWNER")).toThrow("Invalid user role: OWNER")
  })

  it("accepts valid time entry kinds and rejects invalid ones", () => {
    expect(toTimeEntryKind("ENTRY")).toBe("ENTRY")
    expect(() => toTimeEntryKind("BREAK")).toThrow(
      "Invalid time entry kind: BREAK",
    )
  })
})
