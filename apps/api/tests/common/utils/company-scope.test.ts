import { describe, expect, it } from "vitest"

import {
  getOptionalRequestCompanyId,
  getRequestCompanyId,
} from "../../../src/common/utils/company-scope.js"

describe("company scope helpers", () => {
  it("requires authentication", () => {
    expect(() => getRequestCompanyId({} as never)).toThrow(
      "Authentication token is required.",
    )
    expect(() => getOptionalRequestCompanyId({} as never)).toThrow(
      "Authentication token is required.",
    )
  })

  it("returns requested company for platform admins", () => {
    const request = {
      authUser: {
        id: 1,
        companyId: 20,
        role: "PLATFORM_ADMIN",
        email: "admin@example.com",
      },
    } as never

    expect(getRequestCompanyId(request, 30)).toBe(30)
    expect(getOptionalRequestCompanyId(request, 30)).toBe(30)
  })

  it("falls back to the authenticated company when present", () => {
    const request = {
      authUser: {
        id: 1,
        companyId: 20,
        role: "PLATFORM_ADMIN",
        email: "admin@example.com",
      },
    } as never

    expect(getRequestCompanyId(request)).toBe(20)
  })

  it("requires a company id for platform admins without a default company", () => {
    const request = {
      authUser: {
        id: 1,
        companyId: 0,
        role: "PLATFORM_ADMIN",
        email: "admin@example.com",
      },
    } as never

    expect(() => getRequestCompanyId(request)).toThrow(
      "companyId is required for platform administrators.",
    )
  })

  it("pins non-platform users to their own company", () => {
    const request = {
      authUser: {
        id: 1,
        companyId: 20,
        role: "COMPANY_ADMIN",
        email: "admin@example.com",
      },
    } as never

    expect(getRequestCompanyId(request, 999)).toBe(20)
    expect(getOptionalRequestCompanyId(request, 999)).toBe(20)
  })
})
