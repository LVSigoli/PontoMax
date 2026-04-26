const DURATION_PATTERN = /^(\d+)([smhd])$/;

const MULTIPLIER_BY_UNIT = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

export function durationToMilliseconds(value: string) {
  const match = DURATION_PATTERN.exec(value.trim());

  if (!match) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof MULTIPLIER_BY_UNIT;

  return amount * MULTIPLIER_BY_UNIT[unit];
}
