import { describe, expect, it, vi } from "vitest"

const { sendMailMock } = vi.hoisted(() => ({
  sendMailMock: vi.fn(),
}))

vi.mock("../../../src/common/email/mail.service.js", () => ({
  sendMail: sendMailMock,
}))

const { sendInviteEmail, sendPasswordResetEmail } = await import(
  "../../../src/modules/auth/auth-email.service.js"
)

describe("auth-email.service", () => {
  it("sends invite emails with onboarding instructions", async () => {
    await sendInviteEmail({
      to: "demo@example.com",
      fullName: "Ana Demo",
      passwordSetupUrl: "http://localhost/invite",
    })

    expect(sendMailMock).toHaveBeenCalledWith({
      to: "demo@example.com",
      subject: "Ative sua conta no PontoMax",
      text: expect.stringContaining("http://localhost/invite"),
    })
  })

  it("sends reset password emails", async () => {
    await sendPasswordResetEmail({
      to: "demo@example.com",
      fullName: "Ana Demo",
      passwordSetupUrl: "http://localhost/reset",
    })

    expect(sendMailMock).toHaveBeenCalledWith({
      to: "demo@example.com",
      subject: "Redefinicao de senha do PontoMax",
      text: expect.stringContaining("http://localhost/reset"),
    })
  })
})
