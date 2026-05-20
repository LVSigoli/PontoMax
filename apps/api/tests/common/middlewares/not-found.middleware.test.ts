import { describe, expect, it } from "vitest"

import { notFoundMiddleware } from "../../../src/common/middlewares/not-found.middleware.js"
import { createMockResponse } from "../../helpers/http.js"

describe("notFoundMiddleware", () => {
  it("returns a 404 payload with the missing route", () => {
    const response = createMockResponse()

    notFoundMiddleware(
      {
        method: "GET",
        originalUrl: "/unknown",
      } as never,
      response as never,
    )

    expect(response.status).toHaveBeenCalledWith(404)
    expect(response.json).toHaveBeenCalledWith({
      message: "Route GET /unknown not found",
    })
  })
})
