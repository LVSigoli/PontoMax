import { z } from "zod"
import { describe, expect, it, vi } from "vitest"

import { validateRequest } from "../../../src/common/validation/validate-request.js"

describe("validateRequest", () => {
  it("parses and assigns body, query, and params", async () => {
    const handler = validateRequest(
      z.object({
        body: z.object({
          active: z.coerce.boolean(),
        }),
        query: z.object({
          page: z.coerce.number().int(),
        }),
        params: z.object({
          userId: z.coerce.number().int(),
        }),
      }),
    )

    const next = vi.fn()
    const request = {
      body: { active: "true" },
      query: { page: "2" },
      params: { userId: "7" },
    } as never

    await handler(request, {} as never, next)

    expect(request.body).toEqual({ active: true })
    expect(request.query).toEqual({ page: 2 })
    expect(request.params).toEqual({ userId: 7 })
    expect(next).toHaveBeenCalledWith()
  })

  it("forwards zod validation errors", async () => {
    const handler = validateRequest(
      z.object({
        body: z.object({
          email: z.string().email(),
        }),
      }),
    )

    const next = vi.fn()
    const request = {
      body: { email: "invalid" },
      query: {},
      params: {},
    } as never

    await handler(request, {} as never, next)

    expect(next).toHaveBeenCalled()
    expect(next.mock.calls[0]?.[0]?.name).toBe("ZodError")
  })
})
