import { z } from "zod";

const WAYPOINT_TYPES = [
  "walk",
  "moveUp",
  "moveDown",
  "useRope",
  "useShovel",
  "useHole",
  "useLadder",
  "useTeleport",
  "label",
  "stand",
  "useHotkey",
  "refillChecker",
  "depositGold",
  "refill",
  "refillPotions",
  "depositItems",
  "dropFlasks",
] as const;

export const WaypointSchema = z.object({
  id: z.number(),
  type: z.enum(WAYPOINT_TYPES),
  coordinate: z.tuple([z.number(), z.number(), z.number()]).optional(),
  label: z.string().optional(),
  options: z.record(z.unknown()).optional(),
  comment: z.string().optional(),
});

export const CreateRouteSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  waypoints: z.array(WaypointSchema).default([]),
  characterId: z.string().uuid().optional(),
  isPublic: z.boolean().optional(),
});

export const UpdateRouteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  waypoints: z.array(WaypointSchema).optional(),
  characterId: z.string().uuid().nullable().optional(),
  isPublic: z.boolean().optional(),
});

export const ImportRouteSchema = z.object({
  name: z.string().min(1).max(100),
  waypoints: z.array(WaypointSchema),
  metadata: z.record(z.unknown()).optional(),
});

export const RouteSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  userId: z.string().uuid(),
  characterId: z.string().uuid().nullable(),
  waypoints: z.array(WaypointSchema),
  metadata: z.record(z.unknown()).nullable(),
  isPublic: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const RouteListSchema = z.array(RouteSchema);

export const RouteExportSchema = z.object({
  name: z.string(),
  waypoints: z.array(WaypointSchema),
  metadata: z.record(z.unknown()).nullable(),
});

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type CreateRouteInput = z.infer<typeof CreateRouteSchema>;
export type UpdateRouteInput = z.infer<typeof UpdateRouteSchema>;
export type ImportRouteInput = z.infer<typeof ImportRouteSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type Waypoint = z.infer<typeof WaypointSchema>;
