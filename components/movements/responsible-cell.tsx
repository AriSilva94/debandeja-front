import { Avatar } from "@/components/ui/avatar";
import { avatarToneForIndex, initials } from "@/lib/avatar";

export function ResponsibleCell({ name, index }: { name: string; index: number }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar initials={initials(name)} tone={avatarToneForIndex(index)} size="sm" />
      <span className="text-gray-700">{name}</span>
    </div>
  );
}
