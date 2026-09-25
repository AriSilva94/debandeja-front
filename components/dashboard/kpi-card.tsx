import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const TONE_CLASSES = {
  brand: { iconWrap: "bg-brand-subtle", icon: "text-brand", delta: "text-success-text" },
  success: { iconWrap: "bg-success-bg", icon: "text-success", delta: "text-success-text" },
  warning: { iconWrap: "bg-warning-bg", icon: "text-warning-text", delta: "text-warning-text" },
  neutral: { iconWrap: "bg-gray-100", icon: "text-gray-600", delta: "text-gray-600" },
} as const;

type KpiTone = keyof typeof TONE_CLASSES;

type KpiCardProps = {
  label: string;
  value: string;
  delta: string;
  context: string;
  icon: LucideIcon;
  tone?: KpiTone;
};

export function KpiCard({ label, value, delta, context, icon: Icon, tone = "neutral" }: KpiCardProps) {
  const toneClasses = TONE_CLASSES[tone];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-gray-500">{label}</span>
        <div className={cn("flex h-7.5 w-7.5 items-center justify-center rounded-lg", toneClasses.iconWrap)}>
          <Icon size={16} strokeWidth={1.8} className={toneClasses.icon} />
        </div>
      </div>
      <div className="mb-2 text-[30px] font-semibold leading-none tracking-tight text-gray-900">
        {value}
      </div>
      <div className="flex items-center gap-1.5 text-[12.5px]">
        <span className={cn("font-semibold", toneClasses.delta)}>{delta}</span>
        <span className="text-gray-400">{context}</span>
      </div>
    </div>
  );
}
