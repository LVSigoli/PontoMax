import crypto from 'node:crypto';

import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { durationToMilliseconds } from '../../common/utils/duration.js';

export async function issuePasswordResetToken(userId: number) {
  const resetToken = generateOpaqueToken();
  const tokenHash = createTokenHash(resetToken);

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + durationToMilliseconds('1d')),
      },
    }),
  ]);

  return resetToken;
}

export function createTokenHash(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function makePasswordSetupUrl(resetToken: string) {
  const url = new URL('/login', env.APP_URL);
  url.searchParams.set('view', 'replace-password');
  url.searchParams.set('token', resetToken);
  return url.toString();
}

function generateOpaqueToken() {
  return crypto.randomBytes(24).toString('base64url');
}
