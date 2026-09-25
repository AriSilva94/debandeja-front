import { Switch } from "@/components/ui/switch";

type ToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function ToggleRow({ title, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-gray-100 py-4 first:border-0 first:pt-0">
      <div>
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="mt-0.5 text-[12.5px] text-gray-500">{description}</div>
      </div>
      <Switch
        aria-label={title}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
  );
}
