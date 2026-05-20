import { vi } from "vitest"

export function createMockResponse() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
  }

  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  response.send.mockReturnValue(response)

  return response
}
