import express, { Router } from "express"

import request from "supertest"
import { afterEach, describe, expect, it, vi } from "vitest"

describe("createApp", () => {
  afterEach(() => {
    vi.resetModules()
  })

  it("returns the health payload", async () => {
    vi.doMock("../src/modules/index.js", () => ({
      modulesRouter: Router(),
    }))

    const { createApp } = await import("../src/app.js")
    const response = await request(createApp()).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      status: "ok",
      service: "ponto-max-api",
    })
  })

  it("mounts the API router under the configured prefix", async () => {
    const modulesRouter = Router()
    modulesRouter.get("/ping", (_request, response) => {
      response.json({
        ok: true,
      })
    })

    vi.doMock("../src/modules/index.js", () => ({
      modulesRouter,
    }))

    const { createApp } = await import("../src/app.js")
    const response = await request(createApp()).get("/api/ping")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      ok: true,
    })
  })

  it("uses the global not-found and error handlers", async () => {
    const modulesRouter = Router()
    modulesRouter.get("/boom", async () => {
      throw new Error("boom")
    })

    vi.doMock("../src/modules/index.js", () => ({
      modulesRouter,
    }))

    const { createApp } = await import("../src/app.js")
    const app = createApp()
    app.use(express.json())

    const errorResponse = await request(app).get("/api/boom")
    const missingResponse = await request(app).get("/missing")

    expect(errorResponse.status).toBe(500)
    expect(errorResponse.body).toEqual({
      message: "Internal server error",
    })
    expect(missingResponse.status).toBe(404)
    expect(missingResponse.body).toEqual({
      message: "Route GET /missing not found",
    })
  })
})
