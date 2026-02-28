export interface PositionEntry {
  sessionId: string;
  x: number;
  y: number;
  z: number;
  recordedAt: Date;
}

interface BufferEntry {
  positions: PositionEntry[];
  lastPos: { x: number; y: number; z: number };
}

const buffer = new Map<string, BufferEntry>();

export function addPosition(
  sessionId: string,
  x: number,
  y: number,
  z: number,
  timestamp: string,
): void {
  const existing = buffer.get(sessionId);

  if (existing) {
    const { lastPos } = existing;
    if (lastPos.x === x && lastPos.y === y && lastPos.z === z) return;

    existing.positions.push({ sessionId, x, y, z, recordedAt: new Date(timestamp) });
    existing.lastPos = { x, y, z };
    return;
  }

  buffer.set(sessionId, {
    positions: [{ sessionId, x, y, z, recordedAt: new Date(timestamp) }],
    lastPos: { x, y, z },
  });
}

export function drain(): PositionEntry[] {
  const all: PositionEntry[] = [];

  for (const entry of buffer.values()) {
    all.push(...entry.positions);
    entry.positions = [];
  }

  return all;
}

export function removeSession(sessionId: string): void {
  buffer.delete(sessionId);
}
