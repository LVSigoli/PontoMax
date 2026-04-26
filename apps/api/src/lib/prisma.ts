import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __pontoMaxPrisma__: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalThis.__pontoMaxPrisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pontoMaxPrisma__ = prisma;
}
