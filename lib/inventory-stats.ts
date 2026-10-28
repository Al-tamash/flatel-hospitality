/** Inventory counts derived from flat records (never hard-coded in the UI). */

/** Total physical residences; a flat type without `totalUnits` counts as one unit. */
export function getTotalResidenceUnits(rooms: Array<{ totalUnits?: number }>): number {
  return rooms.reduce((sum, room) => sum + (room.totalUnits ?? 1), 0);
}

/** How many units of each flat type exist, keyed by slug. */
export function getUnitCapsByFlatType(
  rooms: Array<{ slug: string; totalUnits?: number }>
): Record<string, number> {
  const caps: Record<string, number> = {};
  for (const room of rooms) caps[room.slug] = (caps[room.slug] ?? 0) + (room.totalUnits ?? 1);
  return caps;
}
