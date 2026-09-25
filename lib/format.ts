export function formatNumber(value: number) {
  return value.toLocaleString("pt-BR");
}

export function formatCurrency(value: number | string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  return { date: DATE_FORMAT.format(date), time: TIME_FORMAT.format(date) };
}

export function formatSigned(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatNumber(Math.abs(value))}`;
}

export function formatCount(count: number, singular: string, plural: string) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

export function formatLastAccess(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  const now = new Date();
  if (now.getTime() - date.getTime() < 5 * 60 * 1000) return "Agora";
  const { date: day, time } = formatDateTime(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return `Hoje, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Ontem, ${time}`;
  return day;
}
