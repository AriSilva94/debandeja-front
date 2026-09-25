import { X } from "lucide-react";

export function ClearFiltersButton({ onClick, label = "Limpar" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-gray-200 px-3 text-[13px] font-medium text-error-text hover:bg-error-bg"
    >
      <X size={13} strokeWidth={2.4} />
      {label}
    </button>
  );
}
