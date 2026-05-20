import { describe, expect, it } from "vitest"

import {
  generateOpaqueToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../../src/common/auth/token.service.js"

describe("token.service", () => {
  it("signs and verifies access tokens", () => {
    const token = signAccessToken({
      id: 1,
      companyId: 2,
      role: "EMPLOYEE",
      email: "demo@example.com",
    })

    expect(verifyAccessToken(token)).toMatchObject({
      id: 1,
      companyId: 2,
      role: "EMPLOYEE",
      email: "demo@example.com",
      type: "access",
    })
  })

  it("signs and verifies refresh tokens", () => {
    const token = signRefreshToken({
      id: 1,
      companyId: 2,
      role: "EMPLOYEE",
      email: "demo@example.com",
      sessionId: 99,
      sessionToken: "opaque",
    })

    expect(verifyRefreshToken(token)).toMatchObject({
      id: 1,
      companyId: 2,
      role: "EMPLOYEE",
      email: "demo@example.com",
      sessionId: 99,
      sessionToken: "opaque",
      type: "refresh",
    })
  })

  it("generates opaque hex refresh tokens", () => {
    const token = generateOpaqueToken()

    expect(token).toMatch(/^[a-f0-9]{96}$/)
  })
})
