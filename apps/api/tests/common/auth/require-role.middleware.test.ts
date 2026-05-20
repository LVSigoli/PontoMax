import { describe, expect, it, vi } from "vitest"

import { requireRole } from "../../../src/common/auth/require-role.middleware.js"

describe("requireRole middleware", () => {
  it("requires authentication first", () => {
    const next = vi.fn()

    requireRole("COMPANY_ADMIN")({} as never, {} as never, next)

    expect(next.mock.calls[0]?.[0]?.message).toBe(
      "Authentication token is required.",
    )
  })

  it("rejects users without the required role", () => {
    const next = vi.fn()
    const request = {
      authUser: {
        id: 1,
        companyId: 2,
        role: "EMPLOYEE",
        email: "demo@example.com",
      },
    } as never

    requireRole("COMPANY_ADMIN")(request, {} as never, next)

    expect(next.mock.calls[0]?.[0]?.message).toBe(
      "You do not have permission to access this resource.",
    )
  })

  it("allows users with any accepted role", () => {
    const next = vi.fn()
    const request = {
      authUser: {
        id: 1,
        companyId: 2,
        role: "COMPANY_ADMIN",
        email: "demo@example.com",
      },
    } as never

    requireRole("COMPANY_ADMIN", "PLATFORM_ADMIN")(
      request,
      {} as never,
      next,
    )

    expect(next).toHaveBeenCalledWith()
  })
})
