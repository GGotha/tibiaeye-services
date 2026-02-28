import {
  EMBED_COLOR_SUCCESS,
  EMBED_COLOR_DANGER,
  EMBED_COLOR_WARNING,
  EMBED_COLOR_INFO,
} from "../../modules/discord/constants.js";

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields: Array<{ name: string; value: string; inline?: boolean }>;
  footer: { text: string };
  timestamp: string;
}

function baseEmbed(title: string, color: number): DiscordEmbed {
  return {
    title,
    color,
    fields: [],
    footer: { text: "TibiaEye" },
    timestamp: new Date().toISOString(),
  };
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function buildSessionStartedEmbed(data: {
  characterName: string;
  huntLocation: string | null;
  level: number | null;
}): DiscordEmbed {
  const embed = baseEmbed("Session Started", EMBED_COLOR_SUCCESS);
  embed.description = `**${data.characterName}** started a new hunt session`;
  embed.fields.push({ name: "Character", value: data.characterName, inline: true });
  if (data.huntLocation) {
    embed.fields.push({ name: "Location", value: data.huntLocation, inline: true });
  }
  if (data.level) {
    embed.fields.push({ name: "Level", value: String(data.level), inline: true });
  }
  return embed;
}

export function buildSessionEndedEmbed(data: {
  characterName: string;
  duration: number;
  totalKills: number;
  xpPerHour: number;
  totalLootValue: number;
  huntLocation: string | null;
}): DiscordEmbed {
  const embed = baseEmbed("Session Ended", EMBED_COLOR_INFO);
  embed.description = `**${data.characterName}** finished hunting`;
  embed.fields.push(
    { name: "Duration", value: formatDuration(data.duration), inline: true },
    { name: "Kills", value: formatNumber(data.totalKills), inline: true },
    { name: "XP/h", value: formatNumber(data.xpPerHour), inline: true },
    { name: "Loot Value", value: `${formatNumber(data.totalLootValue)} gp`, inline: true },
  );
  if (data.huntLocation) {
    embed.fields.push({ name: "Location", value: data.huntLocation, inline: true });
  }
  return embed;
}

export function buildDeathEmbed(data: {
  characterName: string;
  killer?: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
}): DiscordEmbed {
  const embed = baseEmbed("Death", EMBED_COLOR_DANGER);
  embed.description = `**${data.characterName}** has died!`;
  embed.fields.push({ name: "Character", value: data.characterName, inline: true });
  if (data.killer) {
    embed.fields.push({ name: "Killed by", value: data.killer, inline: true });
  }
  if (data.positionX !== undefined && data.positionY !== undefined && data.positionZ !== undefined) {
    embed.fields.push({
      name: "Position",
      value: `${data.positionX}, ${data.positionY}, ${data.positionZ}`,
      inline: true,
    });
  }
  return embed;
}

export function buildLevelUpEmbed(data: {
  characterName: string;
  newLevel: number;
}): DiscordEmbed {
  const embed = baseEmbed("Level Up!", EMBED_COLOR_SUCCESS);
  embed.description = `**${data.characterName}** advanced to level **${data.newLevel}**!`;
  embed.fields.push(
    { name: "Character", value: data.characterName, inline: true },
    { name: "New Level", value: String(data.newLevel), inline: true },
  );
  return embed;
}

export function buildLootDropEmbed(data: {
  characterName: string;
  itemName: string;
  quantity: number;
  estimatedValue: number;
}): DiscordEmbed {
  const embed = baseEmbed("Valuable Loot!", EMBED_COLOR_WARNING);
  embed.description = `**${data.characterName}** looted a valuable item`;
  embed.fields.push(
    { name: "Item", value: data.itemName, inline: true },
    { name: "Quantity", value: String(data.quantity), inline: true },
    { name: "Value", value: `${formatNumber(data.estimatedValue)} gp`, inline: true },
  );
  return embed;
}

export function buildLowHpEmbed(data: {
  characterName: string;
  hpPercent: number;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
}): DiscordEmbed {
  const embed = baseEmbed("Low HP Alert!", EMBED_COLOR_DANGER);
  embed.description = `**${data.characterName}** is at critical health!`;
  embed.fields.push(
    { name: "Character", value: data.characterName, inline: true },
    { name: "HP", value: `${data.hpPercent}%`, inline: true },
  );
  if (data.positionX !== undefined && data.positionY !== undefined && data.positionZ !== undefined) {
    embed.fields.push({
      name: "Position",
      value: `${data.positionX}, ${data.positionY}, ${data.positionZ}`,
      inline: true,
    });
  }
  return embed;
}

export function buildBotStuckEmbed(data: {
  characterName: string;
  currentTask?: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
}): DiscordEmbed {
  const embed = baseEmbed("Bot Stuck!", EMBED_COLOR_DANGER);
  embed.description = `**${data.characterName}**'s bot appears to be stuck`;
  embed.fields.push({ name: "Character", value: data.characterName, inline: true });
  if (data.currentTask) {
    embed.fields.push({ name: "Task", value: data.currentTask, inline: true });
  }
  if (data.positionX !== undefined && data.positionY !== undefined && data.positionZ !== undefined) {
    embed.fields.push({
      name: "Position",
      value: `${data.positionX}, ${data.positionY}, ${data.positionZ}`,
      inline: true,
    });
  }
  return embed;
}

export function buildPeriodicStatsEmbed(data: {
  characterName: string;
  duration: number;
  xpPerHour: number;
  totalKills: number;
  totalLootValue: number;
  hpPercent?: number;
  manaPercent?: number;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  huntLocation?: string | null;
}): DiscordEmbed {
  const embed = baseEmbed("Hunt Stats Update", EMBED_COLOR_INFO);
  embed.description = `Periodic update for **${data.characterName}**`;
  embed.fields.push(
    { name: "Duration", value: formatDuration(data.duration), inline: true },
    { name: "XP/h", value: formatNumber(data.xpPerHour), inline: true },
    { name: "Kills", value: formatNumber(data.totalKills), inline: true },
    { name: "Loot Value", value: `${formatNumber(data.totalLootValue)} gp`, inline: true },
  );
  if (data.hpPercent !== undefined && data.manaPercent !== undefined) {
    embed.fields.push(
      { name: "HP", value: `${data.hpPercent}%`, inline: true },
      { name: "Mana", value: `${data.manaPercent}%`, inline: true },
    );
  }
  if (data.positionX !== undefined && data.positionY !== undefined && data.positionZ !== undefined) {
    embed.fields.push({
      name: "Position",
      value: `${data.positionX}, ${data.positionY}, ${data.positionZ}`,
      inline: true,
    });
  }
  if (data.huntLocation) {
    embed.fields.push({ name: "Location", value: data.huntLocation, inline: true });
  }
  return embed;
}

export function buildTestEmbed(): DiscordEmbed {
  const embed = baseEmbed("TibiaEye - Test Notification", EMBED_COLOR_SUCCESS);
  embed.description = "Your Discord integration is working correctly!";
  embed.fields.push({
    name: "Status",
    value: "Connected",
    inline: true,
  });
  return embed;
}
