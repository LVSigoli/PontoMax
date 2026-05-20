import { Prisma } from "@prisma/client"
import { z, ZodError } from "zod"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AppError } from "../../../src/common/errors/app-error.js"
import { errorHandlerMiddleware } from "../../../src/common/middlewares/error-handler.middleware.js"
import { createMockResponse } from "../../helpers/http.js"

function createKnownRequestError(code: string, meta?: Record<string, unknown>) {
  const error = new Error("prisma") as Prisma.PrismaClientKnownRequestError & {
    code: string
    meta?: Record<string, unknown>
  }

  Object.assign(error, {
    code,
    meta,
  })
  Object.setPrototypeOf(error, Prisma.PrismaClientKnownRequestError.prototype)

  return error
}

describe("errorHandlerMiddleware", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("serializes AppError instances", () => {
    const response = createMockResponse()

    errorHandlerMiddleware(
      new AppError("Forbidden", 403, { reason: "role" }),
      {} as never,
      response as never,
      vi.fn(),
    )

    expect(response.status).toHaveBeenCalledWith(403)
    expect(response.json).toHaveBeenCalledWith({
      message: "Forbidden",
      details: { reason: "role" },
    })
  })

  it("serializes Zod validation errors", () => {
    const response = createMockResponse()
    const validationResult = z.object({ email: z.string().email() }).safeParse({
      email: "invalid",
    })
    const error = validationResult.error as ZodError

    errorHandlerMiddleware(error, {} as never, response as never, vi.fn())

    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json.mock.calls[0]?.[0]?.message).toBe(
      "Request validation failed.",
    )
  })

  it("maps Prisma unique violations to conflict responses", () => {
    const response = createMockResponse()

    errorHandlerMiddleware(
      createKnownRequestError("P2002", { target: ["email"] }),
      {} as never,
      response as never,
      vi.fn(),
    )

    expect(response.status).toHaveBeenCalledWith(409)
    expect(response.json).toHaveBeenCalledWith({
      message: "A record with the same email already exists.",
    })
  })

  it("maps Prisma foreign key violations to conflict responses", () => {
    const response = createMockResponse()

    errorHandlerMiddleware(
      createKnownRequestError("P2003", { field_name: "companyId" }),
      {} as never,
      response as never,
      vi.fn(),
    )

    expect(response.status).toHaveBeenCalledWith(409)
    expect(response.json).toHaveBeenCalledWith({
      message: "The selected companyId is invalid or no longer exists.",
    })
  })

  it("falls back to a generic 500 response", () => {
    const response = createMockResponse()

    errorHandlerMiddleware(
      new Error("unexpected"),
      {} as never,
      response as never,
      vi.fn(),
    )

    expect(response.status).toHaveBeenCalledWith(500)
    expect(response.json).toHaveBeenCalledWith({
      message: "Internal server error",
    })
  })
})
