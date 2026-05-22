import fs from "node:fs/promises"

import { afterEach, describe, expect, it, vi } from "vitest"

const {
  createSmtpTransportMock,
  isSmtpConfiguredMock,
} = vi.hoisted(() => ({
  createSmtpTransportMock: vi.fn(),
  isSmtpConfiguredMock: vi.fn(),
}))

vi.mock("../../../src/common/email/smtp.client.js", () => ({
  createSmtpTransport: createSmtpTransportMock,
  isSmtpConfigured: isSmtpConfiguredMock,
}))

const { env } = await import("../../../src/config/env.js")
const { sendMail } = await import("../../../src/common/email/mail.service.js")

const originalNodeEnv = env.NODE_ENV

describe("sendMail", () => {
  afterEach(async () => {
    env.NODE_ENV = originalNodeEnv
    createSmtpTransportMock.mockReset()
    isSmtpConfiguredMock.mockReset()
    vi.unstubAllGlobals()
  })

  it("writes a preview file when SMTP is not configured", async () => {
    isSmtpConfiguredMock.mockReturnValue(false)
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

  it("requires SMTP in production", async () => {
    isSmtpConfiguredMock.mockReturnValue(false)
    env.NODE_ENV = "production"

    await expect(
      sendMail({
        to: "demo@example.com",
        subject: "Hello",
        text: "Body",
      }),
    ).rejects.toThrow("Missing SMTP configuration for production e-mail delivery.")
  })

  it("sends through SMTP when it is configured", async () => {
    isSmtpConfiguredMock.mockReturnValue(true)
    env.NODE_ENV = "test"

    const smtpSendMailMock = vi.fn().mockResolvedValue(undefined)
    createSmtpTransportMock.mockReturnValue({
      sendMail: smtpSendMailMock,
    })

    const result = await sendMail({
      to: "demo@example.com",
      subject: "Hello",
      text: "Body",
    })

    expect(result).toEqual({
      channel: "smtp",
    })
    expect(smtpSendMailMock).toHaveBeenCalledWith({
      from: env.MAIL_FROM,
      to: "demo@example.com",
      subject: "Hello",
      text: "Body",
    })
  })

  it("surfaces SMTP transport errors", async () => {
    isSmtpConfiguredMock.mockReturnValue(true)
    env.NODE_ENV = "test"

    const smtpSendMailMock = vi
      .fn()
      .mockRejectedValue(new Error("smtp failure"))
    createSmtpTransportMock.mockReturnValue({
      sendMail: smtpSendMailMock,
    })

    await expect(
      sendMail({
        to: "demo@example.com",
        subject: "Hello",
        text: "Body",
      }),
    ).rejects.toThrow("smtp failure")
  })
})
