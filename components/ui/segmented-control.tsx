import { cn } from "@/lib/cn";

type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("flex gap-0.5 rounded-[10px] border border-gray-200 bg-white p-0.75", className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-[13px] font-medium",
            value === option ? "bg-brand-subtle font-semibold text-brand" : "text-gray-500",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
