import { cn } from "@/lib/cn";

type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

function visiblePages(page: number, pageCount: number): (number | "gap")[] {
  const pages: (number | "gap")[] = [];
  for (let n = 1; n <= pageCount; n++) {
    if (n === 1 || n === pageCount || Math.abs(n - page) <= 1) {
      pages.push(n);
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap");
    }
  }
  return pages;
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  const pages = visiblePages(page, pageCount);

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
      >
        Anterior
      </button>
      {pages.map((n, index) =>
        n === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-[13px] text-gray-400">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "h-8 min-w-8 rounded-lg border text-[13px] font-medium",
              n === page
                ? "border-brand bg-brand-subtle text-brand font-semibold"
                : "border-gray-200 bg-white text-gray-600",
            )}
          >
            {n}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page === pageCount}
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
      >
        Próximo
      </button>
    </div>
  );
}
