import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createRouterApp } from "../../helpers/create-router-app"

const mocked = vi.hoisted(() => {
  return {
    authenticateMock: vi.fn(),
    requireRoleMock: vi.fn(() => (_request, _response, next) => {
      next()
    }),
    prisma: {
      journey: {
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
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

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

const { workSchedulesRouter } = await import(
  "../../../src/modules/work-schedules/work-schedules.routes.js"
)

const app = createRouterApp(workSchedulesRouter, "/work-schedules")

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
  mocked.prisma.journey.findMany.mockReset()
  mocked.prisma.journey.findUniqueOrThrow.mockReset()
  mocked.prisma.journey.create.mockReset()
  mocked.prisma.journey.update.mockReset()
  mocked.prisma.journey.delete.mockReset()
  mocked.prisma.auditLog.create.mockReset()
})

describe("work schedules routes", () => {
  it("returns journeys with employee counts", async () => {
    mocked.prisma.journey.findMany.mockResolvedValue([
      {
        id: 20,
        companyId: 10,
        name: "Jornada 8h",
        description: "Padrao",
        scaleCode: "5X2",
        flexibleSchedule: false,
        dailyWorkMinutes: 480,
        weeklyWorkMinutes: 2400,
        expectedEntryTime: new Date("1970-01-01T08:00:00.000Z"),
        expectedExitTime: new Date("1970-01-01T17:00:00.000Z"),
        breakMinutes: 60,
        toleranceMinutes: 10,
        nightShift: false,
        isActive: true,
        _count: {
          userAssignments: 5,
        },
      },
    ])

    const response = await request(app).get("/work-schedules")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      items: [
        {
          id: 20,
          companyId: 10,
          name: "Jornada 8h",
          description: "Padrao",
          scaleCode: "5X2",
          flexibleSchedule: false,
          dailyWorkMinutes: 480,
          weeklyWorkMinutes: 2400,
          expectedEntryTime: "1970-01-01T08:00:00.000Z",
          expectedExitTime: "1970-01-01T17:00:00.000Z",
          breakMinutes: 60,
          toleranceMinutes: 10,
          nightShift: false,
          isActive: true,
          _count: {
            userAssignments: 5,
          },
          employees: 5,
        },
      ],
    })
  })

  it("creates a journey and normalizes time values", async () => {
    mocked.prisma.journey.create.mockResolvedValue({
      id: 21,
      companyId: 10,
      name: "Jornada Nova",
      description: "Descricao",
      scaleCode: "5X2",
      flexibleSchedule: false,
      dailyWorkMinutes: 480,
      weeklyWorkMinutes: 2400,
      expectedEntryTime: new Date("1970-01-01T08:00:00.000Z"),
      expectedExitTime: new Date("1970-01-01T17:00:00.000Z"),
      breakMinutes: 60,
      toleranceMinutes: 10,
      nightShift: false,
      isActive: true,
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app).post("/work-schedules").send({
      companyId: 10,
      name: "Jornada Nova",
      description: "Descricao",
      scaleCode: "5X2",
      flexibleSchedule: false,
      dailyWorkMinutes: 480,
      weeklyWorkMinutes: 2400,
      expectedEntryTime: "08:00",
      expectedExitTime: "17:00",
      breakMinutes: 60,
      toleranceMinutes: 10,
      nightShift: false,
      isActive: true,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      item: {
        id: 21,
        companyId: 10,
        name: "Jornada Nova",
        description: "Descricao",
        scaleCode: "5X2",
        flexibleSchedule: false,
        dailyWorkMinutes: 480,
        weeklyWorkMinutes: 2400,
        expectedEntryTime: "1970-01-01T08:00:00.000Z",
        expectedExitTime: "1970-01-01T17:00:00.000Z",
        breakMinutes: 60,
        toleranceMinutes: 10,
        nightShift: false,
        isActive: true,
      },
    })
    expect(mocked.prisma.journey.create).toHaveBeenCalledWith({
      data: {
        companyId: 10,
        name: "Jornada Nova",
        description: "Descricao",
        scaleCode: "5X2",
        flexibleSchedule: false,
        dailyWorkMinutes: 480,
        weeklyWorkMinutes: 2400,
        expectedEntryTime: new Date("1970-01-01T08:00:00.000Z"),
        expectedExitTime: new Date("1970-01-01T17:00:00.000Z"),
        breakMinutes: 60,
        toleranceMinutes: 10,
        nightShift: false,
        isActive: true,
      },
    })
  })
})
