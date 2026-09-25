export function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_TONE_CYCLE = ["brand", "accent", "gray", "warning", "info"] as const;

export function avatarToneForIndex(index: number) {
  return AVATAR_TONE_CYCLE[index % AVATAR_TONE_CYCLE.length];
}
