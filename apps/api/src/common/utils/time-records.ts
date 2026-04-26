import type { TimeEntryKind } from '@prisma/client';

export interface TimeEntryLike {
  kind: TimeEntryKind;
  recordedAt: Date;
}

function diffInMinutes(start: Date, end: Date) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

export function calculateWorkedMinutes(entries: TimeEntryLike[]) {
  let total = 0;
  let openEntry: Date | null = null;

  for (const entry of [...entries].sort((left, right) => left.recordedAt.getTime() - right.recordedAt.getTime())) {
    if (entry.kind === 'ENTRY') {
      openEntry = entry.recordedAt;
      continue;
    }

    if (!openEntry) {
      continue;
    }

    total += diffInMinutes(openEntry, entry.recordedAt);
    openEntry = null;
  }

  return total;
}
