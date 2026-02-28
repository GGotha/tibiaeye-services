export function experienceForLevel(level: number): number {
  return Math.floor((50 * level ** 3 - 300 * level ** 2 + 850 * level - 600) / 3);
}
