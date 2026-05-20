import { describe, expect, it, vi } from "vitest"

import {
  buildAuditActor,
  buildAuditCompany,
  buildChangeSet,
  normalizeAuditValue,
  parseAuditMetadata,
  recordAuditLog,
} from "../../../src/common/audit/audit-log.service.js"

describe("audit-log.service", () => {
  it("builds actor and company snapshots", () => {
    expect(
      buildAuditActor({
        id: 1,
        fullName: "Ana Demo",
        email: "ana@example.com",
        role: "COMPANY_ADMIN",
      }),
    ).toEqual({
      id: 1,
      name: "Ana Demo",
      email: "ana@example.com",
      role: "COMPANY_ADMIN",
    })

    expect(
      buildAuditCompany({
        id: 10,
        name: "Legal Name",
        tradeName: " Trade Name ",
      }),
    ).toEqual({
      id: 10,
      name: "Trade Name",
    })
  })

  it("normalizes supported values and calculates change sets", () => {
    const before = {
      name: "Ana",
      updatedAt: new Date("2026-05-11T00:00:00.000Z"),
      active: true,
    }
    const after = {
      name: "Ana Maria",
      updatedAt: new Date("2026-05-11T00:00:00.000Z"),
      active: true,
    }

    expect(normalizeAuditValue([1, "2", new Date("2026-05-11T00:00:00.000Z")])).toEqual([
      1,
      "2",
      "2026-05-11T00:00:00.000Z",
    ])
    expect(buildChangeSet(before, after, ["name", "updatedAt", "active"])).toEqual([
      {
        field: "name",
        before: "Ana",
        after: "Ana Maria",
      },
    ])
  })

  it("parses structured and fallback metadata", () => {
    expect(
      parseAuditMetadata(
        JSON.stringify({
          summary: "Updated user",
        }),
      ),
    ).toEqual({
      summary: "Updated user",
    })

    expect(parseAuditMetadata("raw text")).toEqual({
      summary: "raw text",
    })

    expect(parseAuditMetadata("123")).toEqual({
      summary: "123",
    })

    expect(parseAuditMetadata(null)).toBeNull()
  })

  it("persists audit logs through the provided client", async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 })
    const client = {
      auditLog: {
        create,
      },
    }

    await recordAuditLog(client as never, {
      companyId: 10,
      actorUserId: 20,
      entityType: "USER",
      entityId: 30,
      action: "UPDATE",
      metadata: {
        summary: "User updated",
      },
    })

    expect(create).toHaveBeenCalledWith({
      data: {
        companyId: 10,
        actorUserId: 20,
        entityType: "USER",
        entityId: "30",
        action: "UPDATE",
        metadata: JSON.stringify({
          summary: "User updated",
        }),
      },
    })
  })
})
