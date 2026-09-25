import { cn } from "@/lib/cn";

const TONE_CLASSES = {
  neutral: { rail: "bg-gray-300", value: "text-gray-900" },
  low: { rail: "bg-warning", value: "text-warning-text" },
  out: { rail: "bg-error", value: "text-error-text" },
  info: { rail: "bg-info-text", value: "text-gray-900" },
} as const;

type RailStatCardProps = {
  label: string;
  value: string;
  context: string;
  tone?: keyof typeof TONE_CLASSES;
};

export function RailStatCard({ label, value, context, tone = "neutral" }: RailStatCardProps) {
  const toneClasses = TONE_CLASSES[tone];
  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className={cn("w-0.75 shrink-0 self-stretch rounded-sm", toneClasses.rail)} />
      <div>
        <div className="mb-1.5 text-[13px] font-medium text-gray-500">{label}</div>
        <div className={cn("text-[28px] font-semibold leading-none tracking-tight", toneClasses.value)}>
          {value}
        </div>
        <div className="mt-1 text-[12.5px] text-gray-400">{context}</div>
      </div>
    </div>
  );
}
