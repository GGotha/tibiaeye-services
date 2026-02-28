import { z } from "zod";

export const CharacterNameParamSchema = z.object({
  name: z.string().min(1),
});

export const WorldNameParamSchema = z.object({
  name: z.string().min(1),
});

export const TibiaCharacterResponseSchema = z.object({
  name: z.string(),
  world: z.string(),
  level: z.number(),
  vocation: z.string(),
  sex: z.string(),
  achievementPoints: z.number(),
  guild: z.object({ name: z.string(), rank: z.string() }).nullable(),
  lastLogin: z.string(),
  accountStatus: z.string(),
  deaths: z.array(
    z.object({
      time: z.string(),
      level: z.number(),
      killers: z.array(z.object({ name: z.string() })),
    })
  ),
  otherCharacters: z
    .array(z.object({ name: z.string(), world: z.string(), status: z.string() }))
    .nullable(),
});

export const TibiaWorldResponseSchema = z.object({
  name: z.string(),
  playersOnline: z.number(),
  onlineRecordPlayers: z.number(),
  onlineRecordDate: z.string(),
  pvpType: z.string(),
  battlEyeProtected: z.boolean(),
  battlEyeDate: z.string(),
  transferType: z.string(),
  worldQuestTitles: z.array(z.string()),
  onlinePlayers: z.array(
    z.object({ name: z.string(), level: z.number(), vocation: z.string() })
  ),
});

export const TibiaWorldsResponseSchema = z.object({
  worlds: z.array(
    z.object({
      name: z.string(),
      playersOnline: z.number(),
      location: z.string(),
      pvpType: z.string(),
      battlEyeProtected: z.boolean(),
      transferType: z.string(),
    })
  ),
});

export const BoostedCreaturesResponseSchema = z.object({
  boostedBoss: z.object({ name: z.string(), imageUrl: z.string() }),
  boostedCreature: z.object({ name: z.string(), imageUrl: z.string() }),
});

export const RashidLocationResponseSchema = z.object({
  city: z.string(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const SpriteQuerySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["creature", "item", "npc", "outfit"]).default("creature"),
});

export const KillStatisticsResponseSchema = z.object({
  world: z.string(),
  entries: z.array(
    z.object({
      race: z.string(),
      lastDayPlayersKilled: z.number(),
      lastDayKilled: z.number(),
      lastWeekPlayersKilled: z.number(),
      lastWeekKilled: z.number(),
    })
  ),
});
