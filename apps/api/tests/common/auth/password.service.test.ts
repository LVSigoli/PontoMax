import { describe, expect, it } from "vitest"

import {
  hashPassword,
  verifyPassword,
} from "../../../src/common/auth/password.service.js"

describe("password.service", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("123456")

    expect(hash).not.toBe("123456")
    await expect(verifyPassword("123456", hash)).resolves.toBe(true)
    await expect(verifyPassword("654321", hash)).resolves.toBe(false)
  })
})
