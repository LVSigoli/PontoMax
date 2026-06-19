import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createRouterApp } from "../../helpers/create-router-app"

const mocked = vi.hoisted(() => {
  return {
    authenticateMock: vi.fn(),
    requireRoleMock: vi.fn(() => (_request, _response, next) => {
      next()
    }),
    ensureWorkdayMock: vi.fn(),
    recalculateWorkdayMock: vi.fn(),
    prisma: {
      user: {
        findUniqueOrThrow: vi.fn(),
      },
      adjustmentRequest: {
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        create: vi.fn(),
      },
      workday: {
        update: vi.fn(),
      },
      timeEntry: {
        update: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        aggregate: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn(),
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
  ensureWorkday: mocked.ensureWorkdayMock,
  recalculateWorkday: mocked.recalculateWorkdayMock,
}))

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

const { adjustmentRequestsRouter } =
  await import("../../../src/modules/adjustment-requests/adjustment-requests.routes.js")

const app = createRouterApp(adjustmentRequestsRouter, "/adjustment-requests")

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
  mocked.ensureWorkdayMock.mockReset()
  mocked.recalculateWorkdayMock.mockReset()
  mocked.prisma.user.findUniqueOrThrow.mockReset()
  mocked.prisma.adjustmentRequest.findMany.mockReset()
  mocked.prisma.adjustmentRequest.findUniqueOrThrow.mockReset()
  mocked.prisma.adjustmentRequest.create.mockReset()
  mocked.prisma.workday.update.mockReset()
  mocked.prisma.timeEntry.update.mockReset()
  mocked.prisma.timeEntry.findUniqueOrThrow.mockReset()
  mocked.prisma.timeEntry.aggregate.mockReset()
  mocked.prisma.timeEntry.create.mockReset()
  mocked.prisma.timeEntry.findMany.mockReset()
  mocked.prisma.$transaction.mockReset()
  mocked.prisma.auditLog.create.mockReset()
})

describe("adjustment requests routes", () => {
  it("applies platform company filters when listing requests", async () => {
    authUser = {
      id: 99,
      companyId: 0,
      role: "PLATFORM_ADMIN",
      email: "platform@example.com",
    }

    mocked.prisma.adjustmentRequest.findMany.mockResolvedValue([])

    const response = await request(app).get(
      "/adjustment-requests?companyId=42&status=PENDING&from=2026-05-01&to=2026-05-31"
    )

    expect(response.status).toBe(200)
    expect(mocked.prisma.adjustmentRequest.findMany).toHaveBeenCalledWith({
      where: {
        companyId: 42,
        userId: undefined,
        status: "PENDING",
        requestedAt: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      },
      include: {
        requestedBy: true,
        pointAdjustments: true,
        workday: true,
      },
      orderBy: {
        requestedAt: "desc",
      },
    })
  })

  it("creates a new adjustment request", async () => {
    mocked.prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 1,
      companyId: 10,
      fullName: "Manager Demo",
    })
    mocked.ensureWorkdayMock.mockResolvedValue({
      id: 501,
      date: new Date("2026-05-11T00:00:00.000Z"),
    })
    mocked.prisma.adjustmentRequest.create.mockResolvedValue({
      id: 601,
      companyId: 10,
      userId: 1,
      workdayId: 501,
      justification: "Precisei corrigir um registro",
      status: "PENDING",
      pointAdjustments: [
        {
          id: 701,
          actionType: "UPDATE",
          targetKind: "ENTRY",
          timeEntryId: 900,
          originalRecordedAt: "2026-05-11T11:00:00.000Z",
          newRecordedAt: "2026-05-11T11:15:00.000Z",
          reason: "Entrada atrasada",
        },
      ],
    })
    mocked.prisma.workday.update.mockResolvedValue({
      id: 501,
      status: "PENDING_ADJUSTMENT",
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app)
      .post("/adjustment-requests")
      .send({
        workdayDate: "2026-05-11",
        justification: "Precisei corrigir um registro",
        records: [
          {
            timeEntryId: 900,
            actionType: "UPDATE",
            targetKind: "ENTRY",
            originalRecordedAt: "2026-05-11T11:00:00.000Z",
            newRecordedAt: "2026-05-11T11:15:00.000Z",
            reason: "Entrada atrasada",
          },
        ],
      })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      item: expect.objectContaining({
        id: 601,
        companyId: 10,
        userId: 1,
        workdayId: 501,
        justification: "Precisei corrigir um registro",
        status: "PENDING",
        pointAdjustments: [
          {
            id: 701,
            actionType: "UPDATE",
            targetKind: "ENTRY",
            timeEntryId: 900,
            originalRecordedAt: "2026-05-11T11:00:00.000Z",
            newRecordedAt: "2026-05-11T11:15:00.000Z",
            reason: "Entrada atrasada",
          },
        ],
        requestedBy: {
          fullName: "Manager Demo",
        },
        workday: expect.objectContaining({
          id: 501,
          date: "2026-05-11",
          status: "PENDING_ADJUSTMENT",
        }),
      }),
    })
    expect(mocked.ensureWorkdayMock).toHaveBeenCalledWith({
      companyId: 10,
      userId: 1,
      date: "2026-05-11",
    })
    expect(mocked.prisma.workday.update).toHaveBeenCalledWith({
      where: { id: 501 },
      data: {
        status: "PENDING_ADJUSTMENT",
      },
    })
  })

  it("creates a request for the employee selected by a platform administrator", async () => {
    authUser = {
      id: 99,
      companyId: 10,
      role: "PLATFORM_ADMIN",
      email: "platform@example.com",
    }
    mocked.prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 7,
      companyId: 42,
      fullName: "Funcionario Demo",
    })
    mocked.ensureWorkdayMock.mockResolvedValue({
      id: 501,
      date: new Date("2026-05-11T00:00:00.000Z"),
    })
    mocked.prisma.adjustmentRequest.create.mockResolvedValue({
      id: 601,
      companyId: 42,
      userId: 7,
      workdayId: 501,
      justification: "Correcao solicitada pelo administrador",
      status: "PENDING",
      pointAdjustments: [],
    })
    mocked.prisma.workday.update.mockResolvedValue({
      id: 501,
      status: "PENDING_ADJUSTMENT",
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app)
      .post("/adjustment-requests")
      .send({
        userId: 7,
        workdayDate: "2026-05-11",
        justification: "Correcao solicitada pelo administrador",
        records: [
          {
            actionType: "CREATE",
            targetKind: "ENTRY",
            newRecordedAt: "2026-05-11T11:00:00.000Z",
          },
        ],
      })

    expect(response.status).toBe(201)
    expect(mocked.ensureWorkdayMock).toHaveBeenCalledWith({
      companyId: 42,
      userId: 7,
      date: "2026-05-11",
    })
    expect(mocked.prisma.adjustmentRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: 42,
          userId: 7,
        }),
      })
    )
  })

  it("approves an adjustment request only when the final sequence stays valid", async () => {
    mocked.prisma.adjustmentRequest.findUniqueOrThrow.mockResolvedValue({
      id: 601,
      companyId: 10,
      userId: 1,
      workdayId: 501,
      pointAdjustments: [
        {
          id: 701,
          actionType: "CREATE",
          targetKind: "ENTRY",
          timeEntryId: null,
          originalRecordedAt: null,
          newRecordedAt: "2026-05-11T16:00:00.000Z",
          reason: "Nova entrada",
        },
        {
          id: 702,
          actionType: "CREATE",
          targetKind: "EXIT",
          timeEntryId: null,
          originalRecordedAt: null,
          newRecordedAt: "2026-05-11T20:00:00.000Z",
          reason: "Nova saida",
        },
      ],
      workday: {
        id: 501,
      },
    })

    const transaction = {
      adjustmentRequest: {
        update: vi.fn().mockResolvedValue({ id: 601 }),
      },
      workday: {
        update: vi.fn(),
      },
      timeEntry: {
        update: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        aggregate: vi
          .fn()
          .mockResolvedValueOnce({ _max: { sequence: 2 } })
          .mockResolvedValueOnce({ _max: { sequence: 3 } }),
        create: vi.fn().mockResolvedValue({ id: 702 }),
        findMany: vi.fn().mockResolvedValue([
          {
            kind: "ENTRY",
            recordedAt: new Date("2026-05-11T11:00:00.000Z"),
            sequence: 1,
          },
          {
            kind: "EXIT",
            recordedAt: new Date("2026-05-11T15:00:00.000Z"),
            sequence: 2,
          },
          {
            kind: "ENTRY",
            recordedAt: new Date("2026-05-11T16:00:00.000Z"),
            sequence: 3,
          },
          {
            kind: "EXIT",
            recordedAt: new Date("2026-05-11T20:00:00.000Z"),
            sequence: 4,
          },
        ]),
      },
    }

    mocked.prisma.$transaction.mockImplementation(async (callback) =>
      callback(transaction as never)
    )
    mocked.recalculateWorkdayMock.mockResolvedValue(undefined)
    mocked.prisma.workday.update.mockResolvedValue({
      id: 501,
      date: new Date("2026-05-11T00:00:00.000Z"),
      status: "ADJUSTED",
      timeEntries: [],
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app)
      .patch("/adjustment-requests/601/review")
      .send({
        status: "APPROVED",
        reviewNotes: "Tudo certo",
      })

    expect(response.status).toBe(200)
    expect(transaction.timeEntry.findMany).toHaveBeenCalledWith({
      where: {
        workdayId: 501,
        status: "ACTIVE",
      },
      orderBy: [
        {
          recordedAt: "asc",
        },
        {
          sequence: "asc",
        },
      ],
    })
    expect(mocked.recalculateWorkdayMock).toHaveBeenCalledWith(501)
    expect(mocked.prisma.workday.update).toHaveBeenCalledWith({
      where: { id: 501 },
      data: {
        status: "ADJUSTED",
      },
      include: {
        timeEntries: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            recordedAt: "asc",
          },
        },
      },
    })
  })

  it("rejects approval when the resulting sequence becomes invalid", async () => {
    mocked.prisma.adjustmentRequest.findUniqueOrThrow.mockResolvedValue({
      id: 601,
      companyId: 10,
      userId: 1,
      workdayId: 501,
      pointAdjustments: [
        {
          id: 701,
          actionType: "CREATE",
          targetKind: "ENTRY",
          timeEntryId: null,
          originalRecordedAt: null,
          newRecordedAt: "2026-05-11T13:00:00.000Z",
          reason: "Nova entrada",
        },
      ],
      workday: {
        id: 501,
      },
    })

    const transaction = {
      adjustmentRequest: {
        update: vi.fn().mockResolvedValue({ id: 601 }),
      },
      workday: {
        update: vi.fn(),
      },
      timeEntry: {
        update: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        aggregate: vi.fn().mockResolvedValue({ _max: { sequence: 2 } }),
        create: vi.fn().mockResolvedValue({ id: 702 }),
        findMany: vi.fn().mockResolvedValue([
          {
            kind: "ENTRY",
            recordedAt: new Date("2026-05-11T11:00:00.000Z"),
            sequence: 1,
          },
          {
            kind: "EXIT",
            recordedAt: new Date("2026-05-11T15:00:00.000Z"),
            sequence: 2,
          },
          {
            kind: "ENTRY",
            recordedAt: new Date("2026-05-11T13:00:00.000Z"),
            sequence: 3,
          },
        ]),
      },
    }

    mocked.prisma.$transaction.mockImplementation(async (callback) =>
      callback(transaction as never)
    )
    mocked.recalculateWorkdayMock.mockResolvedValue(undefined)
    mocked.prisma.workday.update.mockResolvedValue({
      id: 501,
      date: new Date("2026-05-11T00:00:00.000Z"),
      status: "ADJUSTED",
      timeEntries: [],
    })

    const response = await request(app)
      .patch("/adjustment-requests/601/review")
      .send({
        status: "APPROVED",
        reviewNotes: "Precisa bater as regras",
      })

    expect(response.status).toBe(400)
    expect(mocked.recalculateWorkdayMock).not.toHaveBeenCalled()
    expect(mocked.prisma.workday.update).not.toHaveBeenCalled()
  })

  it("allows a platform administrator to review requests from another company", async () => {
    authUser = {
      id: 99,
      companyId: 10,
      role: "PLATFORM_ADMIN",
      email: "platform@example.com",
    }

    mocked.prisma.adjustmentRequest.findUniqueOrThrow.mockResolvedValue({
      id: 601,
      companyId: 42,
      userId: 1,
      workdayId: 501,
      pointAdjustments: [],
      workday: {
        id: 501,
      },
    })

    const transaction = {
      adjustmentRequest: {
        update: vi.fn().mockResolvedValue({ id: 601 }),
      },
      workday: {
        update: vi.fn().mockResolvedValue({ id: 501 }),
      },
      timeEntry: {
        update: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        aggregate: vi.fn(),
        create: vi.fn(),
      },
    }

    mocked.prisma.$transaction.mockImplementation(async (callback) =>
      callback(transaction as never)
    )
    mocked.prisma.workday.update.mockResolvedValue({
      id: 501,
      date: new Date("2026-05-11T00:00:00.000Z"),
      status: "REJECTED",
      timeEntries: [],
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app)
      .patch("/adjustment-requests/601/review")
      .send({
        status: "REJECTED",
      })

    expect(response.status).toBe(200)
  })

  it("allows a platform administrator to review their own request", async () => {
    authUser = {
      id: 99,
      companyId: 10,
      role: "PLATFORM_ADMIN",
      email: "platform@example.com",
    }

    mocked.prisma.adjustmentRequest.findUniqueOrThrow.mockResolvedValue({
      id: 601,
      companyId: 10,
      userId: 99,
      workdayId: 501,
      pointAdjustments: [],
      workday: {
        id: 501,
      },
    })

    const transaction = {
      adjustmentRequest: {
        update: vi.fn().mockResolvedValue({ id: 601 }),
      },
      workday: {
        update: vi.fn().mockResolvedValue({ id: 501 }),
      },
      timeEntry: {
        update: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        aggregate: vi.fn(),
        create: vi.fn(),
      },
    }

    mocked.prisma.$transaction.mockImplementation(async (callback) =>
      callback(transaction as never)
    )
    mocked.prisma.workday.update.mockResolvedValue({
      id: 501,
      date: new Date("2026-05-11T00:00:00.000Z"),
      status: "REJECTED",
      timeEntries: [],
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app)
      .patch("/adjustment-requests/601/review")
      .send({
        status: "REJECTED",
      })

    expect(response.status).toBe(200)
  })

  it("rejects an adjustment request and updates the workday status", async () => {
    authUser = {
      id: 7,
      companyId: 10,
      role: "COMPANY_ADMIN",
      email: "manager@example.com",
    }

    mocked.prisma.adjustmentRequest.findUniqueOrThrow.mockResolvedValue({
      id: 601,
      companyId: 10,
      userId: 1,
      workdayId: 501,
      pointAdjustments: [],
      workday: {
        id: 501,
      },
    })

    const transaction = {
      adjustmentRequest: {
        update: vi.fn().mockResolvedValue({ id: 601 }),
      },
      workday: {
        update: vi.fn().mockResolvedValue({ id: 501 }),
      },
      timeEntry: {
        update: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        aggregate: vi.fn(),
        create: vi.fn(),
      },
    }

    mocked.prisma.$transaction.mockImplementation(async (callback) =>
      callback(transaction as never)
    )
    mocked.prisma.workday.update.mockResolvedValue({
      id: 501,
      date: new Date("2026-05-11T00:00:00.000Z"),
      status: "REJECTED",
      timeEntries: [],
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app)
      .patch("/adjustment-requests/601/review")
      .send({
        status: "REJECTED",
        reviewNotes: "Inconsistencia encontrada",
      })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      item: {
        id: 601,
        status: "REJECTED",
        workday: {
          id: 501,
          date: "2026-05-11",
          status: "REJECTED",
          timeEntries: [],
        },
      },
    })
    expect(transaction.adjustmentRequest.update).toHaveBeenCalledWith({
      where: { id: 601 },
      data: {
        status: "REJECTED",
        reviewNotes: "Inconsistencia encontrada",
        reviewedById: 7,
        reviewedAt: expect.any(Date),
      },
    })
    expect(transaction.workday.update).toHaveBeenCalledWith({
      where: { id: 501 },
      data: {
        status: "REJECTED",
      },
    })
    expect(mocked.prisma.workday.update).toHaveBeenCalledWith({
      where: { id: 501 },
      data: {
        status: "REJECTED",
      },
      include: {
        timeEntries: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            recordedAt: "asc",
          },
        },
      },
    })
    expect(mocked.recalculateWorkdayMock).not.toHaveBeenCalled()
  })
})
