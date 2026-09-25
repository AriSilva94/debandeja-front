import { cn } from "@/lib/cn";

export const SETTINGS_TABS = ["Empresa", "Conta", "Segurança", "Preferências"] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];

type SettingsNavProps = {
  value: SettingsTab;
  onChange: (tab: SettingsTab) => void;
};

export function SettingsNav({ value, onChange }: SettingsNavProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-gray-200 bg-white p-2.5">
      {SETTINGS_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "flex h-9 w-full items-center rounded-lg px-2.5 text-left text-[13.5px] font-medium",
            value === tab ? "bg-brand-subtle font-semibold text-brand" : "text-gray-700 hover:bg-gray-100",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
