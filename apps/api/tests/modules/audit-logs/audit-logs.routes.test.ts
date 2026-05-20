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
      auditLog: {
        count: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn(),
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

const { auditLogsRouter } = await import(
  "../../../src/modules/audit-logs/audit-logs.routes.js"
)

const app = createRouterApp(auditLogsRouter, "/audit-logs")

let authUser = {
  id: 1,
  companyId: 10,
  role: "PLATFORM_ADMIN",
  email: "admin@example.com",
}

beforeEach(() => {
  authUser = {
    id: 1,
    companyId: 10,
    role: "PLATFORM_ADMIN",
    email: "admin@example.com",
  }

  mocked.authenticateMock.mockImplementation((request, _response, next) => {
    request.authUser = authUser
    next()
  })
  mocked.requireRoleMock.mockImplementation(() => (_request, _response, next) => {
    next()
  })
  mocked.prisma.auditLog.count.mockReset()
  mocked.prisma.auditLog.findMany.mockReset()
  mocked.prisma.$transaction.mockReset()
})

describe("audit logs routes", () => {
  it("returns paginated audit logs with parsed metadata", async () => {
    const createdAt = new Date("2026-05-11T12:00:00.000Z")
    const metadata = {
      summary: "User updated",
      company: {
        name: "Fallback Co",
      },
      actor: {
        name: "Ana Demo",
        email: "ana@example.com",
      },
    }
    const auditLog = {
      id: 77,
      companyId: null,
      company: null,
      actorUserId: null,
      actorUser: null,
      entityType: "USER",
      entityId: "1",
      action: "UPDATE",
      metadata: JSON.stringify(metadata),
      createdAt,
    }

    mocked.prisma.auditLog.count.mockResolvedValue(1)
    mocked.prisma.auditLog.findMany.mockResolvedValue([auditLog])
    mocked.prisma.$transaction.mockResolvedValue([1, [auditLog]])

    const response = await request(app).get(
      "/audit-logs?entityType=USER&action=UPDATE&entityId=1&from=2026-05-01&to=2026-05-31&page=2&pageSize=10"
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      items: [
        {
          id: 77,
          companyId: null,
          companyName: "Fallback Co",
          actorUserId: null,
          actorUserName: "Ana Demo",
          actorUserEmail: "ana@example.com",
          entityType: "USER",
          entityId: "1",
          action: "UPDATE",
          summary: "User updated",
          metadata,
          createdAt: "2026-05-11T12:00:00.000Z",
        },
      ],
      meta: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      },
    })
    expect(mocked.prisma.auditLog.count).toHaveBeenCalledOnce()
    expect(mocked.prisma.auditLog.findMany).toHaveBeenCalledOnce()
  })
})
