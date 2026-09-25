import { formatNumber } from "@/lib/format";

export function paginationSummary(total: number, page: number, pageSize: number, noun: string, emptyLabel: string) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rangeLabel =
    total === 0
      ? emptyLabel
      : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, total)} de ${formatNumber(total)} ${noun}`;
  return { pageCount, currentPage, rangeLabel };
}

export function withPageReset(setPage: (page: number) => void) {
  return <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };
}
