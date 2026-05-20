import express from "express"

import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { errorHandlerMiddleware } from "../../../src/common/middlewares/error-handler.middleware.js"

const mocked = vi.hoisted(() => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    authSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    passwordResetToken: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  }

  return {
    prisma,
    recordAuditLogMock: vi.fn(),
    verifyPasswordMock: vi.fn(),
    hashPasswordMock: vi.fn(),
    generateOpaqueTokenMock: vi.fn(),
    signAccessTokenMock: vi.fn(),
    signRefreshTokenMock: vi.fn(),
    verifyRefreshTokenMock: vi.fn(),
    issuePasswordResetTokenMock: vi.fn(),
    createTokenHashMock: vi.fn(),
    authenticateMock: vi.fn(),
  }
})

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

vi.mock("../../../src/common/audit/index.js", () => ({
  buildAuditActor: (user: { id: number; fullName: string; email: string; role: string }) => ({
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role,
  }),
  buildAuditCompany: (company: { id: number; name: string; tradeName?: string | null }) => ({
    id: company.id,
    name: company.tradeName ?? company.name,
  }),
  recordAuditLog: mocked.recordAuditLogMock,
}))

vi.mock("../../../src/common/auth/password.service.js", () => ({
  verifyPassword: mocked.verifyPasswordMock,
  hashPassword: mocked.hashPasswordMock,
}))

vi.mock("../../../src/common/auth/token.service.js", () => ({
  generateOpaqueToken: mocked.generateOpaqueTokenMock,
  signAccessToken: mocked.signAccessTokenMock,
  signRefreshToken: mocked.signRefreshTokenMock,
  verifyRefreshToken: mocked.verifyRefreshTokenMock,
}))

vi.mock("../../../src/modules/auth/password-reset.service.js", () => ({
  issuePasswordResetToken: mocked.issuePasswordResetTokenMock,
  createTokenHash: mocked.createTokenHashMock,
}))

vi.mock("../../../src/common/auth/auth.middleware.js", () => ({
  authenticate: mocked.authenticateMock,
}))

const { authRouter } = await import("../../../src/modules/auth/auth.routes.js")

const app = express()
app.use(express.json())
app.use("/auth", authRouter)
app.use(errorHandlerMiddleware)

const baseCompany = {
  id: 10,
  clientId: 1,
  name: "PontoMax",
  legalName: "PontoMax LTDA",
  tradeName: "PontoMax",
  cnpj: "12345678000100",
  timezone: "America/Sao_Paulo",
  isActive: true,
  createdAt: new Date("2026-05-11T00:00:00.000Z"),
  updatedAt: new Date("2026-05-11T00:00:00.000Z"),
}

const baseUser = {
  id: 1,
  companyId: 10,
  employeeCode: null,
  fullName: "Ana Demo",
  email: "ana@example.com",
  cpf: "12345678900",
  passwordHash: "hashed-password",
  mustChangePassword: false,
  role: "COMPANY_ADMIN",
  position: "Gerente",
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date("2026-05-11T00:00:00.000Z"),
  updatedAt: new Date("2026-05-11T00:00:00.000Z"),
  company: baseCompany,
}

function resetAllMocks() {
  mocked.prisma.user.findUnique.mockReset()
  mocked.prisma.user.update.mockReset()
  mocked.prisma.user.findUniqueOrThrow.mockReset()
  mocked.prisma.authSession.create.mockReset()
  mocked.prisma.authSession.findUnique.mockReset()
  mocked.prisma.authSession.updateMany.mockReset()
  mocked.prisma.passwordResetToken.findUnique.mockReset()
  mocked.prisma.passwordResetToken.update.mockReset()
  mocked.prisma.$transaction.mockReset()
  mocked.recordAuditLogMock.mockReset()
  mocked.verifyPasswordMock.mockReset()
  mocked.hashPasswordMock.mockReset()
  mocked.generateOpaqueTokenMock.mockReset()
  mocked.signAccessTokenMock.mockReset()
  mocked.signRefreshTokenMock.mockReset()
  mocked.verifyRefreshTokenMock.mockReset()
  mocked.issuePasswordResetTokenMock.mockReset()
  mocked.createTokenHashMock.mockReset()
  mocked.authenticateMock.mockReset()
}

describe("auth routes", () => {
  beforeEach(() => {
    resetAllMocks()

    mocked.recordAuditLogMock.mockResolvedValue(undefined)
    mocked.verifyPasswordMock.mockResolvedValue(true)
    mocked.hashPasswordMock.mockResolvedValue("new-password-hash")
    mocked.generateOpaqueTokenMock.mockReturnValue("raw-refresh-token")
    mocked.signAccessTokenMock.mockReturnValue("signed-access-token")
    mocked.signRefreshTokenMock.mockReturnValue("signed-refresh-token")
    mocked.verifyRefreshTokenMock.mockReturnValue({
      id: 1,
      companyId: 10,
      role: "COMPANY_ADMIN",
      email: "ana@example.com",
      sessionId: 77,
      sessionToken: "raw-refresh-token",
      type: "refresh",
    })
    mocked.issuePasswordResetTokenMock.mockResolvedValue("reset-token")
    mocked.createTokenHashMock.mockImplementation((token: string) => `hash:${token}`)
    mocked.authenticateMock.mockImplementation((request, _response, next) => {
      request.authUser = {
        id: 1,
        companyId: 10,
        role: "COMPANY_ADMIN",
        email: "ana@example.com",
      }
      next()
    })
    mocked.prisma.user.update.mockResolvedValue(baseUser)
    mocked.prisma.authSession.create.mockResolvedValue({ id: 77 })
    mocked.prisma.authSession.updateMany.mockResolvedValue({ count: 1 })
    mocked.prisma.passwordResetToken.update.mockResolvedValue({ id: 5 })
    mocked.prisma.$transaction.mockResolvedValue([])
  })

  it("rejects login when the user does not exist", async () => {
    mocked.prisma.user.findUnique.mockResolvedValue(null)

    const response = await request(app).post("/auth/login").send({
      email: "missing@example.com",
      password: "123456",
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: "Invalid email or password.",
    })
  })

  it("rejects login when the password is invalid", async () => {
    mocked.prisma.user.findUnique.mockResolvedValue(baseUser)
    mocked.verifyPasswordMock.mockResolvedValue(false)

    const response = await request(app).post("/auth/login").send({
      email: "Ana@Example.com",
      password: "wrong-password",
    })

    expect(mocked.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "ana@example.com" },
      include: {
        company: true,
      },
    })
    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: "Invalid email or password.",
    })
  })

  it("returns a password-change payload when the user must rotate the password", async () => {
    mocked.prisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      mustChangePassword: true,
    })

    const response = await request(app).post("/auth/login").send({
      email: "ana@example.com",
      password: "123456",
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      requiresPasswordChange: true,
      message: "Password change is required before accessing the platform.",
      email: "ana@example.com",
      resetToken: "reset-token",
    })
    expect(mocked.issuePasswordResetTokenMock).toHaveBeenCalledWith(1)
    expect(mocked.recordAuditLogMock).toHaveBeenCalledOnce()
  })

  it("creates a session and returns tokens on successful login", async () => {
    mocked.prisma.user.findUnique.mockResolvedValue(baseUser)

    const response = await request(app).post("/auth/login").send({
      email: "ana@example.com",
      password: "123456",
    })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      requiresPasswordChange: false,
      accessToken: "signed-access-token",
      refreshToken: "signed-refresh-token",
      user: {
        id: "1",
        email: "ana@example.com",
        role: "COMPANY_ADMIN",
        companyId: 10,
      },
    })
    expect(mocked.prisma.authSession.create).toHaveBeenCalledOnce()
    expect(mocked.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        lastLoginAt: expect.any(Date),
      },
    })
  })

  it("rejects refresh requests for missing or invalid sessions", async () => {
    mocked.prisma.authSession.findUnique.mockResolvedValue(null)

    const response = await request(app).post("/auth/refresh").send({
      refreshToken: "refresh-token",
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: "Refresh token is invalid or expired.",
    })
  })

  it("rejects refresh requests when the stored session token does not match", async () => {
    mocked.prisma.authSession.findUnique.mockResolvedValue({
      id: 77,
      refreshToken: "other-token",
      revokedAt: null,
      status: "ACTIVE",
      expiresAt: new Date("2099-05-11T00:00:00.000Z"),
      user: baseUser,
    })

    const response = await request(app).post("/auth/refresh").send({
      refreshToken: "refresh-token",
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: "Refresh token is invalid or expired.",
    })
  })

  it("returns a rotated access token for valid refresh requests", async () => {
    mocked.prisma.authSession.findUnique.mockResolvedValue({
      id: 77,
      refreshToken: "raw-refresh-token",
      revokedAt: null,
      status: "ACTIVE",
      expiresAt: new Date("2099-05-11T00:00:00.000Z"),
      user: baseUser,
    })

    const response = await request(app).post("/auth/refresh").send({
      refreshToken: "refresh-token",
    })

    expect(response.status).toBe(200)
    expect(response.body.accessToken).toBe("signed-access-token")
    expect(response.body.refreshToken).toBe("signed-refresh-token")
  })

  it("revokes the session during logout", async () => {
    mocked.prisma.user.findUniqueOrThrow.mockResolvedValue(baseUser)

    const response = await request(app).post("/auth/logout").send({
      refreshToken: "refresh-token",
    })

    expect(response.status).toBe(204)
    expect(mocked.prisma.authSession.updateMany).toHaveBeenCalledWith({
      where: {
        id: 77,
        refreshToken: "raw-refresh-token",
        status: "ACTIVE",
      },
      data: {
        status: "REVOKED",
        revokedAt: expect.any(Date),
      },
    })
  })

  it("returns the current user payload from /me", async () => {
    mocked.prisma.user.findUniqueOrThrow.mockResolvedValue(baseUser)

    const response = await request(app).get("/auth/me")

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      user: {
        id: "1",
        email: "ana@example.com",
        companyId: 10,
      },
    })
    expect(mocked.authenticateMock).toHaveBeenCalledOnce()
  })

  it("returns the forgot-password guidance message", async () => {
    const response = await request(app).post("/auth/forgot-password").send({
      email: "ana@example.com",
    })

    expect(response.status).toBe(200)
    expect(response.body.message).toContain("entre em contato com um administrador")
  })

  it("rejects reset-password requests with invalid tokens", async () => {
    mocked.prisma.passwordResetToken.findUnique.mockResolvedValue(null)

    const response = await request(app).post("/auth/reset-password").send({
      token: "invalid-token",
      password: "654321",
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: "Password reset token is invalid or expired.",
    })
  })

  it("resets the password and revokes active sessions", async () => {
    mocked.prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 5,
      userId: 1,
      tokenHash: "hash:valid-token",
      expiresAt: new Date("2099-05-11T00:00:00.000Z"),
      usedAt: null,
      createdAt: new Date("2026-05-11T00:00:00.000Z"),
    })
    mocked.prisma.user.findUniqueOrThrow.mockResolvedValue(baseUser)

    const response = await request(app).post("/auth/reset-password").send({
      token: "valid-token",
      password: "654321",
    })

    expect(response.status).toBe(204)
    expect(mocked.createTokenHashMock).toHaveBeenCalledWith("valid-token")
    expect(mocked.hashPasswordMock).toHaveBeenCalledWith("654321")
    expect(mocked.prisma.$transaction).toHaveBeenCalledOnce()
    expect(mocked.recordAuditLogMock).toHaveBeenCalledOnce()
  })
})
