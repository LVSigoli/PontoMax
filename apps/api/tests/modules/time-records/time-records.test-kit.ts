import { vi } from "vitest"

const mocked = {
  prisma: {
    workday: {
      findUniqueOrThrow: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    userJourneyAssignment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    holiday: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    adjustmentRequest: {
      count: vi.fn(),
    },
    timeEntry: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
    },
  },
}

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: mocked.prisma,
}))

export { mocked }

export function resetTimeRecordsMocks() {
  mocked.prisma.workday.findUniqueOrThrow.mockReset()
  mocked.prisma.workday.findUnique.mockReset()
  mocked.prisma.workday.findMany.mockReset()
  mocked.prisma.workday.upsert.mockReset()
  mocked.prisma.workday.update.mockReset()
  mocked.prisma.userJourneyAssignment.findFirst.mockReset()
  mocked.prisma.userJourneyAssignment.findMany.mockReset()
  mocked.prisma.holiday.findFirst.mockReset()
  mocked.prisma.holiday.findMany.mockReset()
  mocked.prisma.adjustmentRequest.count.mockReset()
  mocked.prisma.timeEntry.findMany.mockReset()
  mocked.prisma.timeEntry.aggregate.mockReset()
  mocked.prisma.timeEntry.create.mockReset()
}
