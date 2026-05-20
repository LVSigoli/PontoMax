import fs from "node:fs/promises"

import { afterEach, describe, expect, it, vi } from "vitest"

import { env } from "../../../src/config/env.js"
import { sendMail } from "../../../src/common/email/mail.service.js"

const originalResendKey = env.RESEND_API_KEY
const originalNodeEnv = env.NODE_ENV

describe("sendMail", () => {
  afterEach(async () => {
    env.RESEND_API_KEY = originalResendKey
    env.NODE_ENV = originalNodeEnv
    vi.unstubAllGlobals()
  })

  it("writes a preview file when Resend is not configured", async () => {
    env.RESEND_API_KEY = undefined
    env.NODE_ENV = "test"

    const result = await sendMail({
      to: "demo@example.com",
      subject: "Hello",
      text: "Body",
    })

    expect(result.channel).toBe("file")
    expect(result.previewPath).toBeTruthy()

    const content = await fs.readFile(result.previewPath!, "utf-8")
    expect(content).toContain("Subject: Hello")
    expect(content).toContain("Body")

    await fs.unlink(result.previewPath!)
  })

  it("requires Resend in production", async () => {
    env.RESEND_API_KEY = undefined
    env.NODE_ENV = "production"

    await expect(
      sendMail({
        to: "demo@example.com",
        subject: "Hello",
        text: "Body",
      }),
    ).rejects.toThrow("Missing RESEND_API_KEY for production e-mail delivery.")
  })

  it("sends through Resend when the API key is configured", async () => {
    env.RESEND_API_KEY = "resend-key"
    env.NODE_ENV = "test"

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    })
    vi.stubGlobal("fetch", fetchMock)

    const result = await sendMail({
      to: "demo@example.com",
      subject: "Hello",
      text: "Body",
    })

    expect(result).toEqual({
      channel: "resend",
    })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it("surfaces Resend API errors", async () => {
    env.RESEND_API_KEY = "resend-key"
    env.NODE_ENV = "test"

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue("upstream failure"),
      }),
    )

    await expect(
      sendMail({
        to: "demo@example.com",
        subject: "Hello",
        text: "Body",
      }),
    ).rejects.toThrow(
      "Unable to send e-mail via Resend: 500 upstream failure",
    )
  })
})
