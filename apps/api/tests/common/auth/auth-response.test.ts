import { describe, expect, it } from "vitest"

import {
  makeSessionResponse,
  mapRoleToGroups,
} from "../../../src/common/auth/auth-response.js"

describe("auth-response", () => {
  it("maps roles into groups", () => {
    expect(mapRoleToGroups("EMPLOYEE")).toEqual(["EMPLOYEE"])
    expect(mapRoleToGroups("CLIENT_ADMIN")).toEqual(["COMPANY_ADMIN"])
  })

  it("builds a normalized session response", () => {
    const response = makeSessionResponse({
      accessToken: "access",
      refreshToken: "refresh",
      user: {
        id: 1,
        companyId: 20,
        fullName: "Ana Demo",
        email: "ana@example.com",
        passwordHash: "hash",
        cpf: "123",
        role: "CLIENT_ADMIN",
        mustChangePassword: false,
        isActive: true,
        createdAt: new Date("2026-05-11T00:00:00.000Z"),
        updatedAt: new Date("2026-05-11T00:00:00.000Z"),
        employeeCode: null,
        position: null,
        lastLoginAt: null,
        company: {
          id: 20,
          clientId: 1,
          name: "PontoMax",
          legalName: "PontoMax LTDA",
          tradeName: null,
          cnpj: "123",
          timezone: "America/Sao_Paulo",
          isActive: true,
          createdAt: new Date("2026-05-11T00:00:00.000Z"),
          updatedAt: new Date("2026-05-11T00:00:00.000Z"),
        },
      },
    })

    expect(response).toMatchObject({
      requiresPasswordChange: false,
      accessToken: "access",
      refreshToken: "refresh",
      user: {
        id: "1",
        name: "Ana Demo",
        role: "COMPANY_ADMIN",
        groups: ["COMPANY_ADMIN"],
        companyId: 20,
        companyName: "PontoMax",
      },
    })
  })
})
