function resolveApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return `http://${window.location.hostname}:3333`;

  try {
    const parsed = new URL(envUrl);
    if (parsed.hostname === "localhost" && window.location.hostname !== "localhost") {
      return `http://${window.location.hostname}:${parsed.port || "3333"}`;
    }
    return envUrl;
  } catch {
    return envUrl;
  }
}

function spriteProxyUrl(name: string, type: string): string {
  const base = resolveApiBase();
  const params = new URLSearchParams({ name, type });
  return `${base}/api/v1/tibia-data/sprite?${params.toString()}`;
}

export function creatureSpriteUrl(name: string): string {
  return spriteProxyUrl(name, "creature");
}

export function itemSpriteUrl(name: string): string {
  return spriteProxyUrl(name, "item");
}

export function npcSpriteUrl(name: string): string {
  return spriteProxyUrl(name, "npc");
}

const VOCATION_OUTFIT_MAP: Record<string, string> = {
  "Elite Knight": "Knight",
  Knight: "Knight",
  "Elder Druid": "Druid",
  Druid: "Druid",
  "Royal Paladin": "Hunter",
  Paladin: "Hunter",
  "Master Sorcerer": "Mage",
  Sorcerer: "Mage",
};

export function outfitSpriteUrl(vocation: string, sex = "Male"): string {
  const outfitName = VOCATION_OUTFIT_MAP[vocation] || "Citizen";
  return spriteProxyUrl(`Outfit_${outfitName}_${sex}_Addon_3`, "outfit");
}
