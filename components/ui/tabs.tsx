import { cn } from "@/lib/cn";

export type TabItem = {
  label: string;
  count?: number;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (label: string) => void;
  className?: string;
};

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-5.5", className)}>
      {items.map((item) => {
        const active = item.label === value;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onChange(item.label)}
            className={cn(
              "-mb-px flex items-center border-b-2 pb-2.75 text-[13.5px] font-medium",
              active ? "border-brand font-semibold text-brand" : "border-transparent text-gray-500",
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                className={cn(
                  "ml-1.5 rounded-md px-1.5 py-px text-[11.5px] font-semibold",
                  active ? "bg-brand-subtle text-brand" : "bg-gray-100 text-gray-500",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
