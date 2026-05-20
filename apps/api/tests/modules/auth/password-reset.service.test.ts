import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const {
  prismaMock,
  updateManyMock,
  createMock,
  transactionMock,
} = vi.hoisted(() => {
  const updateMany = vi.fn().mockReturnValue({ step: "updateMany" })
  const create = vi.fn().mockReturnValue({ step: "create" })
  const $transaction = vi.fn().mockResolvedValue([])

  return {
    prismaMock: {
      passwordResetToken: {
        updateMany,
        create,
      },
      $transaction,
    },
    updateManyMock: updateMany,
    createMock: create,
    transactionMock: $transaction,
  }
})

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}))

const {
  createTokenHash,
  issuePasswordResetToken,
  makePasswordSetupUrl,
} = await import("../../../src/modules/auth/password-reset.service.js")

describe("password-reset.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("creates stable SHA-256 hashes", () => {
    expect(createTokenHash("token")).toBe(
      "3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0",
    )
  })

  it("builds a password setup url", () => {
    expect(makePasswordSetupUrl("abc")).toBe(
      "http://localhost:3000/login?view=replace-password&token=abc",
    )
  })

  it("expires previous tokens and creates a new reset token", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-11T00:00:00.000Z"))

    const token = await issuePasswordResetToken(99)

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(updateManyMock).toHaveBeenCalledWith({
      where: {
        userId: 99,
        usedAt: null,
      },
      data: {
        usedAt: new Date("2026-05-11T00:00:00.000Z"),
      },
    })

    expect(createMock).toHaveBeenCalledWith({
      data: {
        userId: 99,
        tokenHash: createTokenHash(token),
        expiresAt: new Date("2026-05-12T00:00:00.000Z"),
      },
    })

    expect(transactionMock).toHaveBeenCalledWith([
      { step: "updateMany" },
      { step: "create" },
    ])
  })
})
