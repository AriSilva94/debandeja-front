export function startOfDaysAgo(days: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);
  return start.toISOString();
}

export const PERIOD_LABELS = ["Hoje", "7 dias", "30 dias"] as const;
export type PeriodLabel = (typeof PERIOD_LABELS)[number];

export const PERIOD_DAYS: Record<PeriodLabel, number> = { Hoje: 0, "7 dias": 6, "30 dias": 29 };
