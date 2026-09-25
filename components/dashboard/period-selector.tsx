import { PERIOD_LABELS, type PeriodLabel } from "@/lib/period";
import { SegmentedControl } from "@/components/ui/segmented-control";

type PeriodSelectorProps = {
  value: PeriodLabel;
  onChange: (period: PeriodLabel) => void;
};

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return <SegmentedControl options={PERIOD_LABELS} value={value} onChange={onChange} />;
}
