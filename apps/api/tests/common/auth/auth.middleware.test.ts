import { describe, expect, it, vi } from "vitest"

const { verifyAccessTokenMock } = vi.hoisted(() => ({
  verifyAccessTokenMock: vi.fn(),
}))

vi.mock("../../../src/common/auth/token.service.js", () => ({
  verifyAccessToken: verifyAccessTokenMock,
}))

const { authenticate } = await import(
  "../../../src/common/auth/auth.middleware.js"
)

describe("authenticate middleware", () => {
  it("requires a bearer token", () => {
    const next = vi.fn()
    const request = {
      headers: {},
    } as never

    authenticate(request, {} as never, next)

    expect(next.mock.calls[0]?.[0]?.message).toBe(
      "Authentication token is required.",
    )
  })

  it("attaches the authenticated user when the token is valid", () => {
    verifyAccessTokenMock.mockReturnValue({
      id: 1,
      companyId: 2,
      role: "EMPLOYEE",
      email: "demo@example.com",
    })

    const next = vi.fn()
    const request = {
      headers: {
        authorization: "Bearer valid-token",
      },
    } as never

    authenticate(request, {} as never, next)

    expect(request.authUser).toEqual({
      id: 1,
      companyId: 2,
      role: "EMPLOYEE",
      email: "demo@example.com",
    })
    expect(next).toHaveBeenCalledWith()
  })

  it("rejects invalid or expired tokens", () => {
    verifyAccessTokenMock.mockImplementation(() => {
      throw new Error("invalid")
    })

    const next = vi.fn()
    const request = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    } as never

    authenticate(request, {} as never, next)

    expect(next.mock.calls[0]?.[0]?.message).toBe(
      "Invalid or expired authentication token.",
    )
  })
})
