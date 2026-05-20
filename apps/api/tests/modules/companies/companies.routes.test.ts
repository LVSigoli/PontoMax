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
      company: {
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

const { companiesRouter } = await import(
  "../../../src/modules/companies/companies.routes.js"
)

const app = createRouterApp(companiesRouter, "/companies")

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
  mocked.prisma.company.findMany.mockReset()
  mocked.prisma.company.findUniqueOrThrow.mockReset()
  mocked.prisma.company.create.mockReset()
  mocked.prisma.company.update.mockReset()
  mocked.prisma.company.delete.mockReset()
  mocked.prisma.auditLog.create.mockReset()
})

describe("companies routes", () => {
  it("returns companies for a platform admin", async () => {
    mocked.prisma.company.findMany.mockResolvedValue([
      {
        id: 11,
        clientId: 2,
        client: {
          name: "Client Alpha",
        },
        name: "Alpha",
        legalName: "Alpha LTDA",
        tradeName: "Alpha Tech",
        cnpj: "11222333000144",
        timezone: "America/Sao_Paulo",
        isActive: true,
        _count: {
          users: 3,
        },
      },
    ])

    const response = await request(app).get("/companies")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      items: [
        {
          id: 11,
          clientId: 2,
          clientName: "Client Alpha",
          name: "Alpha",
          legalName: "Alpha LTDA",
          tradeName: "Alpha Tech",
          cnpj: "11222333000144",
          timezone: "America/Sao_Paulo",
          isActive: true,
          employees: 3,
        },
      ],
    })
  })

  it("creates a company and records the audit log", async () => {
    mocked.prisma.company.create.mockResolvedValue({
      id: 20,
      clientId: 10,
      name: "Nova Empresa",
      legalName: "Nova Empresa LTDA",
      tradeName: "Nova Empresa",
      cnpj: "22333444000155",
      timezone: "America/Sao_Paulo",
      isActive: true,
    })
    mocked.prisma.auditLog.create.mockResolvedValue({ id: 1 })

    const response = await request(app).post("/companies").send({
      clientId: 10,
      name: "Nova Empresa",
      legalName: "Nova Empresa LTDA",
      tradeName: "Nova Empresa",
      cnpj: "22333444000155",
      timezone: "America/Sao_Paulo",
      isActive: true,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      item: {
        id: 20,
        clientId: 10,
        name: "Nova Empresa",
        legalName: "Nova Empresa LTDA",
        tradeName: "Nova Empresa",
        cnpj: "22333444000155",
        timezone: "America/Sao_Paulo",
        isActive: true,
      },
    })
    expect(mocked.prisma.company.create).toHaveBeenCalledWith({
      data: {
        clientId: 10,
        name: "Nova Empresa",
        legalName: "Nova Empresa LTDA",
        tradeName: "Nova Empresa",
        cnpj: "22333444000155",
        timezone: "America/Sao_Paulo",
        isActive: true,
      },
    })
  })
})
