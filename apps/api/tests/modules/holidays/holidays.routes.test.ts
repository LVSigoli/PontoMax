import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createRouterApp } from "../../helpers/create-router-app"

const mocked = vi.hoisted(() => {
  return {
    authenticateMock: vi.fn(),
    requireRoleMock: vi.fn(() => (_request, _response, next) => {
      next()
    }),
    recalculateWorkdayMock: vi.fn(),
    prisma: {
      holiday: {
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      workday: {
        findMany: vi.fn(),
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

vi.mock("../../../src/modules/time-records/time-records.service.js", () => ({
  recalculateWorkday: mocked.recalculateWorkdayMock,
}))

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

const { holidaysRouter } = await import(
  "../../../src/modules/holidays/holidays.routes.js"
)

const app = createRouterApp(holidaysRouter, "/holidays")

let authUser = {
  id: 1,
  companyId: 10,
  role: "COMPANY_ADMIN",
  email: "manager@example.com",
}

beforeEach(() => {
  authUser = {
    id: 1,
    companyId: 10,
    role: "COMPANY_ADMIN",
    email: "manager@example.com",
  }

  mocked.authenticateMock.mockImplementation((request, _response, next) => {
    request.authUser = authUser
    next()
  })
  mocked.prisma.holiday.findMany.mockReset()
  mocked.prisma.holiday.findUniqueOrThrow.mockReset()
  mocked.prisma.holiday.create.mockReset()
  mocked.prisma.holiday.update.mockReset()
  mocked.prisma.holiday.delete.mockReset()
  mocked.prisma.workday.findMany.mockReset()
  mocked.prisma.auditLog.create.mockReset()
  mocked.recalculateWorkdayMock.mockReset()
})

describe("holidays routes", () => {
  it("lists holidays scoped to the authenticated company for employees", async () => {
    authUser = {
      id: 8,
      companyId: 10,
      role: "EMPLOYEE",
      email: "employee@example.com",
    }

    mocked.prisma.holiday.findMany.mockResolvedValue([
      {
        id: 21,
        name: "Ano Novo",
        date: new Date("2026-01-01T00:00:00.000Z"),
        type: "NATIONAL",
        isActive: true,
        companyAssignments: [
          {
            company: {
              id: 99,
              name: "Brasil",
              tradeName: null,
            },
          },
        ],
      },
    ])

    const response = await request(app).get("/holidays?companyId=42&year=2026")

    expect(response.status).toBe(200)
    expect(mocked.prisma.holiday.findMany).toHaveBeenCalledWith({
      where: {
        date: {
          gte: new Date("2026-01-01T00:00:00.000Z"),
          lte: new Date("2026-12-31T00:00:00.000Z"),
        },
        OR: [
          {
            type: "NATIONAL",
          },
          {
            companyAssignments: {
              some: {
                companyId: 10,
              },
            },
          },
        ],
      },
      include: {
        companyAssignments: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                tradeName: true,
              },
            },
          },
          orderBy: {
            company: {
              name: "asc",
            },
          },
        },
      },
      orderBy: [
        {
          date: "asc",
        },
        {
          name: "asc",
        },
      ],
    })
    expect(response.body).toEqual({
      items: [
        {
          id: 21,
          name: "Ano Novo",
          date: "2026-01-01T00:00:00.000Z",
          type: "NATIONAL",
          isActive: true,
          companyIds: [99],
          companies: [
            {
              id: 99,
              name: "Brasil",
            },
          ],
        },
      ],
    })
  })

  it("creates a company holiday and refreshes matching workdays", async () => {
    mocked.prisma.holiday.create.mockResolvedValue({
      id: 33,
      name: "Aniversario da Empresa",
      date: new Date("2026-05-11T00:00:00.000Z"),
      type: "COMPANY",
      isActive: true,
      companyAssignments: [
        {
          company: {
            id: 10,
            name: "PontoMax",
            tradeName: "PontoMax",
          },
        },
      ],
    })
    mocked.prisma.workday.findMany.mockResolvedValue([{ id: 501 }])
    mocked.recalculateWorkdayMock.mockResolvedValue(undefined)
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app).post("/holidays").send({
      companyIds: [10],
      name: "Aniversario da Empresa",
      date: "2026-05-11",
      type: "COMPANY",
      isActive: true,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      item: {
        id: 33,
        name: "Aniversario da Empresa",
        date: "2026-05-11T00:00:00.000Z",
        type: "COMPANY",
        isActive: true,
        companyIds: [10],
        companies: [
          {
            id: 10,
            name: "PontoMax",
          },
        ],
      },
    })
    expect(mocked.recalculateWorkdayMock).toHaveBeenCalledWith(501)
  })

  it("removes a holiday and refreshes workdays", async () => {
    mocked.prisma.holiday.findUniqueOrThrow.mockResolvedValue({
      id: 44,
      name: "Feriado Local",
      date: new Date("2026-06-01T00:00:00.000Z"),
      type: "COMPANY",
      isActive: true,
      companyAssignments: [
        {
          companyId: 10,
          company: {
            id: 10,
            name: "PontoMax",
            tradeName: "PontoMax",
          },
        },
      ],
    })
    mocked.prisma.holiday.delete.mockResolvedValue({ id: 44 })
    mocked.prisma.workday.findMany.mockResolvedValue([{ id: 502 }])
    mocked.recalculateWorkdayMock.mockResolvedValue(undefined)
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app).delete("/holidays/44")

    expect(response.status).toBe(204)
    expect(mocked.prisma.holiday.delete).toHaveBeenCalledWith({
      where: {
        id: 44,
      },
    })
    expect(mocked.recalculateWorkdayMock).toHaveBeenCalledWith(502)
  })
})
