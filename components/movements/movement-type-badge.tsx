import { Badge } from "@/components/ui/badge";
import type { Movement } from "@/lib/api/types";
import { MOVEMENT_TYPE_GLYPH, MOVEMENT_TYPE_LABEL, MOVEMENT_TYPE_TONE } from "@/lib/movements";

export function MovementTypeBadge({ movement }: { movement: Pick<Movement, "type" | "reversesMovementId"> }) {
  if (movement.reversesMovementId) return <Badge tone="neutral">↺ Estorno</Badge>;
  return (
    <Badge tone={MOVEMENT_TYPE_TONE[movement.type]}>
      {MOVEMENT_TYPE_GLYPH[movement.type]} {MOVEMENT_TYPE_LABEL[movement.type]}
    </Badge>
  );
}
