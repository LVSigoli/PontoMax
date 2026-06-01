import type { TimeEntryKind } from '../constants/domain-enums.js';

export interface TimeEntryLike {
  kind: TimeEntryKind;
  recordedAt: Date;
  sequence?: number;
}

function diffInMinutes(start: Date, end: Date) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

function sortTimeEntries(entries: TimeEntryLike[]) {
  return [...entries].sort((left, right) => {
    const recordedAtDiff =
      left.recordedAt.getTime() - right.recordedAt.getTime();

    if (recordedAtDiff !== 0) {
      return recordedAtDiff;
    }

    return (left.sequence ?? 0) - (right.sequence ?? 0);
  });
}

export function calculateWorkedMinutes(entries: TimeEntryLike[]) {
  let total = 0;
  let openEntry: Date | null = null;

  for (const entry of sortTimeEntries(entries)) {
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

export function isAlternatingTimeEntrySequence(entries: TimeEntryLike[]) {
  const sortedEntries = sortTimeEntries(entries);

  if (sortedEntries.length === 0) {
    return true;
  }

  if (sortedEntries[0].kind !== 'ENTRY') {
    return false;
  }

  for (let index = 1; index < sortedEntries.length; index += 1) {
    const current = sortedEntries[index];
    const previous = sortedEntries[index - 1];

    if (current.kind === previous.kind) {
      return false;
    }

    if (current.recordedAt.getTime() <= previous.recordedAt.getTime()) {
      return false;
    }
  }

  return true;
}
