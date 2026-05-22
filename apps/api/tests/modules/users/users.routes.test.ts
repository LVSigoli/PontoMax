import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createRouterApp } from "../../helpers/create-router-app"

const mocked = vi.hoisted(() => {
  return {
    authenticateMock: vi.fn(),
    requireRoleMock: vi.fn(() => (_request, _response, next) => {
      next()
    }),
    hashPasswordMock: vi.fn(),
    issuePasswordResetTokenMock: vi.fn(),
    makePasswordSetupUrlMock: vi.fn(),
    sendInviteEmailMock: vi.fn(),
    prisma: {
      user: {
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      journey: {
        findUniqueOrThrow: vi.fn(),
      },
      userJourneyAssignment: {
        upsert: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    },
  }
})

vi.mock("../../../src/common/auth/auth.middleware.js", () => ({
  authenticate: mocked.authenticateMock,
}))

vi.mock("../../../src/common/auth/require-role.middleware.js", () => ({
  requireRole: mocked.requireRoleMock,
}))

vi.mock("../../../src/common/auth/password.service.js", () => ({
  hashPassword: mocked.hashPasswordMock,
}))

vi.mock("../../../src/modules/auth/password-reset.service.js", () => ({
  issuePasswordResetToken: mocked.issuePasswordResetTokenMock,
  makePasswordSetupUrl: mocked.makePasswordSetupUrlMock,
}))

vi.mock("../../../src/modules/auth/auth-email.service.js", () => ({
  sendInviteEmail: mocked.sendInviteEmailMock,
}))

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

const { usersRouter } = await import("../../../src/modules/users/users.routes.js")

const app = createRouterApp(usersRouter, "/users")

let authUser = {
  id: 1,
  companyId: 10,
  role: "COMPANY_ADMIN",
  email: "admin@example.com",
}

beforeEach(() => {
  authUser = {
    id: 1,
    companyId: 10,
    role: "COMPANY_ADMIN",
    email: "admin@example.com",
  }

  mocked.authenticateMock.mockImplementation((request, _response, next) => {
    request.authUser = authUser
    next()
  })
  mocked.hashPasswordMock.mockResolvedValue("hashed-password")
  mocked.issuePasswordResetTokenMock.mockResolvedValue("reset-token")
  mocked.makePasswordSetupUrlMock.mockReturnValue(
    "http://localhost:3000/login?view=replace-password&token=reset-token"
  )

  mocked.prisma.user.findMany.mockReset()
  mocked.prisma.user.findUniqueOrThrow.mockReset()
  mocked.prisma.user.create.mockReset()
  mocked.prisma.user.update.mockReset()
  mocked.prisma.user.delete.mockReset()
  mocked.prisma.journey.findUniqueOrThrow.mockReset()
  mocked.prisma.userJourneyAssignment.upsert.mockReset()
  mocked.prisma.auditLog.create.mockReset()
  mocked.sendInviteEmailMock.mockReset()
  mocked.sendInviteEmailMock.mockResolvedValue({
    channel: "smtp",
  })
})

describe("users routes", () => {
  it("creates a user and returns the invitation payload", async () => {
    mocked.prisma.journey.findUniqueOrThrow.mockResolvedValue({
      id: 20,
      companyId: 10,
    })
    mocked.prisma.user.create.mockResolvedValue({
      id: 99,
    })
    mocked.prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 99,
      companyId: 10,
      company: {
        name: "PontoMax",
      },
      employeeCode: "EMP-99",
      fullName: "Maria Demo",
      email: "maria@example.com",
      cpf: "12345678901",
      role: "EMPLOYEE",
      position: "Analista",
      isActive: true,
      journeyAssignments: [
        {
          journeyId: 20,
          journey: {
            name: "Jornada 8h",
          },
        },
      ],
    })
    mocked.prisma.userJourneyAssignment.upsert.mockResolvedValue({
      id: 1,
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app).post("/users").send({
      companyId: 10,
      employeeCode: "EMP-99",
      fullName: "Maria Demo",
      email: "maria@example.com",
      cpf: "12345678901",
      password: "123456",
      role: "EMPLOYEE",
      position: "Analista",
      isActive: true,
      journeyId: 20,
      journeyValidFrom: "2026-05-11",
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      item: {
        id: 99,
        companyId: 10,
        companyName: "PontoMax",
        employeeCode: "EMP-99",
        fullName: "Maria Demo",
        email: "maria@example.com",
        cpf: "12345678901",
        role: "EMPLOYEE",
        position: "Analista",
        isActive: true,
        journeyId: 20,
        journeyName: "Jornada 8h",
      },
      invite: {
        email: "maria@example.com",
        invitationUrl:
          "http://localhost:3000/login?view=replace-password&token=reset-token",
        requiresPasswordChange: true,
        copyText: expect.stringContaining("maria@example.com"),
      },
    })
    expect(mocked.prisma.user.create).toHaveBeenCalledWith({
      data: {
        companyId: 10,
        employeeCode: "EMP-99",
        fullName: "Maria Demo",
        email: "maria@example.com",
        cpf: "12345678901",
        passwordHash: "hashed-password",
        mustChangePassword: true,
        role: "EMPLOYEE",
        position: "Analista",
        isActive: true,
      },
    })
    expect(mocked.prisma.userJourneyAssignment.upsert).toHaveBeenCalledOnce()
    expect(mocked.issuePasswordResetTokenMock).toHaveBeenCalledWith(99)
    expect(mocked.sendInviteEmailMock).toHaveBeenCalledWith({
      to: "maria@example.com",
      fullName: "Maria Demo",
      passwordSetupUrl:
        "http://localhost:3000/login?view=replace-password&token=reset-token",
    })
  })

  it("updates an existing user and reassigns the journey", async () => {
    authUser = {
      id: 7,
      companyId: 10,
      role: "COMPANY_ADMIN",
      email: "manager@example.com",
    }

    mocked.prisma.user.findUniqueOrThrow
      .mockResolvedValueOnce({
        id: 55,
        companyId: 10,
        company: {
          name: "PontoMax",
        },
        employeeCode: "EMP-55",
        fullName: "Joao Demo",
        email: "joao@example.com",
        cpf: "12345678901",
        role: "EMPLOYEE",
        position: "Desenvolvedor",
        isActive: true,
        journeyAssignments: [
          {
            journeyId: 20,
            journey: {
              name: "Jornada 8h",
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        id: 55,
        companyId: 10,
        company: {
          name: "PontoMax",
        },
        employeeCode: "EMP-55",
        fullName: "Joao Demo",
        email: "joao.novo@example.com",
        cpf: "12345678901",
        role: "COMPANY_ADMIN",
        position: "Lead",
        isActive: false,
        journeyAssignments: [
          {
            journeyId: 30,
            journey: {
              name: "Jornada 6h",
            },
          },
        ],
      })
    mocked.prisma.journey.findUniqueOrThrow.mockResolvedValue({
      id: 30,
      companyId: 10,
    })
    mocked.prisma.user.update.mockResolvedValue({
      id: 55,
      companyId: 10,
    })
    mocked.prisma.userJourneyAssignment.upsert.mockResolvedValue({
      id: 2,
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app).patch("/users/55").send({
      fullName: "Joao Demo",
      email: "joao.novo@example.com",
      cpf: "12345678901",
      password: "new-password",
      role: "COMPANY_ADMIN",
      position: "Lead",
      isActive: false,
      journeyId: 30,
      journeyValidFrom: "2026-05-11",
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      item: {
        id: 55,
        companyId: 10,
        companyName: "PontoMax",
        employeeCode: "EMP-55",
        fullName: "Joao Demo",
        email: "joao.novo@example.com",
        cpf: "12345678901",
        role: "COMPANY_ADMIN",
        position: "Lead",
        isActive: false,
        journeyId: 30,
        journeyName: "Jornada 6h",
      },
    })
    expect(mocked.hashPasswordMock).toHaveBeenCalledWith("new-password")
    expect(mocked.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 55 },
      data: {
        companyId: undefined,
        employeeCode: undefined,
        fullName: "Joao Demo",
        email: "joao.novo@example.com",
        cpf: "12345678901",
        role: "COMPANY_ADMIN",
        position: "Lead",
        isActive: false,
        passwordHash: "hashed-password",
      },
    })
    expect(mocked.prisma.userJourneyAssignment.upsert).toHaveBeenCalledOnce()
  })
})
