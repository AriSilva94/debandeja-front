import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-13 text-center">
      <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
        <Icon size={20} strokeWidth={1.8} className="text-gray-400" />
      </div>
      <div className="mb-1.25 text-[15.5px] font-semibold text-gray-900">{title}</div>
      <p className="mb-4 max-w-80 text-[13.5px] leading-relaxed text-gray-500">{description}</p>
      {action}
    </div>
  );
}
