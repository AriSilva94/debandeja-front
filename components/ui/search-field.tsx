import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

type SearchFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export function SearchField({ label, value, onChange, placeholder, className }: SearchFieldProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-[10px] border border-gray-200 px-3 text-[13.5px]",
        className,
      )}
    >
      <Search size={15} className="text-gray-400" />
      <input
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-none bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
      />
    </div>
  );
}
