import { Prisma } from "@prisma/client"
import { describe, expect, it, vi } from "vitest"

import { AppError } from "../../../src/common/errors/app-error.js"
import { asyncHandler } from "../../../src/common/utils/async-handler.js"

function createPrismaInitializationError(message: string) {
  const error = new Error(message) as Prisma.PrismaClientInitializationError
  Object.setPrototypeOf(error, Prisma.PrismaClientInitializationError.prototype)
  return error
}

describe("asyncHandler", () => {
  it("lets successful handlers finish without calling next", async () => {
    const next = vi.fn()
    const handler = asyncHandler(async () => undefined)

    await handler({} as never, {} as never, next)

    expect(next).not.toHaveBeenCalled()
  })

  it("passes AppError instances through unchanged", async () => {
    const next = vi.fn()
    const appError = new AppError("No access", 403)
    const handler = asyncHandler(async () => {
      throw appError
    })

    await handler({} as never, {} as never, next)

    expect(next).toHaveBeenCalledWith(appError)
  })

  it("maps Prisma initialization failures to a 503 AppError", async () => {
    const next = vi.fn()
    const handler = asyncHandler(async () => {
      throw createPrismaInitializationError("TLS failed")
    })

    await handler({} as never, {} as never, next)

    const error = next.mock.calls[0]?.[0] as AppError
    expect(error).toBeInstanceOf(AppError)
    expect(error.statusCode).toBe(503)
    expect(error.message).toBe("Database connection is unavailable.")
    expect(error.details).toBe("TLS failed")
  })

  it("wraps generic errors as internal AppError instances", async () => {
    const next = vi.fn()
    const handler = asyncHandler(async () => {
      throw new Error("Boom")
    })

    await handler({} as never, {} as never, next)

    const error = next.mock.calls[0]?.[0] as AppError
    expect(error.statusCode).toBe(500)
    expect(error.message).toBe("Boom")
  })

  it("falls back to a generic message for unknown thrown values", async () => {
    const next = vi.fn()
    const handler = asyncHandler(async () => {
      throw "boom"
    })

    await handler({} as never, {} as never, next)

    const error = next.mock.calls[0]?.[0] as AppError
    expect(error.statusCode).toBe(500)
    expect(error.message).toBe("Internal server error")
  })
})
