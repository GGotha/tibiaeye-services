import type { Repository } from "typeorm";
import { GameEventEntity } from "../../../entities/game-event.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { RouteEntity } from "../../../entities/route.entity.js";
import type { RouteSuggestions } from "../schemas.js";
import { GetRouteSegmentsUseCase } from "./get-route-segments.use-case.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export class GetRouteSuggestionsUseCase {
  constructor(
    private readonly gameEventRepo: Repository<GameEventEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly routeRepo: Repository<RouteEntity>,
  ) {}

  async execute(userId: string, routeId: string): Promise<RouteSuggestions> {
    const fallback: RouteSuggestions = {
      summary: "Unable to generate suggestions.",
      overallScore: 0,
      suggestions: [],
      analyzedAt: new Date().toISOString(),
    };

    // Get route
    const route = await this.routeRepo.findOne({ where: { id: routeId } });
    if (!route || route.userId !== userId) {
      return fallback;
    }

    // Get segment analytics
    const segmentsUseCase = new GetRouteSegmentsUseCase(
      this.gameEventRepo,
      this.sessionRepo,
      this.characterRepo,
      this.routeRepo,
    );
    const analytics = await segmentsUseCase.execute(userId, routeId);

    if (analytics.segments.length === 0) {
      return {
        summary: "Not enough data to analyze. Run the route a few more times to collect timing data.",
        overallScore: 0,
        suggestions: [],
        analyzedAt: new Date().toISOString(),
      };
    }

    // Build prompt
    const waypointList = route.waypoints
      .map((wp, i) => {
        const coord = wp.coordinate ? `[${wp.coordinate.join(", ")}]` : "no coord";
        const label = wp.label ? ` (${wp.label})` : "";
        return `  ${i}: ${wp.type} at ${coord}${label}`;
      })
      .join("\n");

    const segmentList = analytics.segments
      .map((seg) => {
        const flags: string[] = [];
        if (seg.isSlow) flags.push("SLOW");
        if (seg.isHighVariance) flags.push("HIGH_VARIANCE");
        const flagStr = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
        return `  ${seg.fromIndex} -> ${seg.toIndex}: avg=${seg.avgSeconds}s, p95=${seg.p95Seconds}s, samples=${seg.sampleCount}${flagStr}`;
      })
      .join("\n");

    const prompt = `You are a Tibia route optimization expert. Analyze this bot hunting route and suggest improvements.

## Route: ${route.name}
Total waypoints: ${route.waypoints.length}
Average loop time: ${analytics.totalAvgLoopSeconds}s
Global average segment time: ${analytics.globalAvgSegmentSeconds}s

## Waypoints:
${waypointList}

## Segment Timing (from historical data):
${segmentList}

## Instructions:
- Identify the slowest segments and explain WHY they might be slow
- Suggest specific optimizations (shortcuts, floor changes, removing unnecessary waypoints)
- For each suggestion, provide: which segment, what to change, estimated time savings
- Consider Tibia mechanics: floor changes via rope/shovel/ladder are fast but need items
- Consider that the bot walks tile-by-tile, so diagonal paths are faster than L-shaped paths
- Return response in JSON format only (no markdown, no code fences):
{
  "summary": "brief overview of route efficiency",
  "overallScore": 1-10,
  "suggestions": [
    {
      "type": "slow_segment" | "backtracking" | "floor_optimization" | "waypoint_redundant" | "reorder",
      "segmentFrom": index,
      "segmentTo": index,
      "description": "human readable suggestion",
      "estimatedSavingsSeconds": number,
      "priority": "high" | "medium" | "low"
    }
  ]
}`;

    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return {
          summary: "AI optimization is not configured. Set the ANTHROPIC_API_KEY environment variable.",
          overallScore: 0,
          suggestions: [],
          analyzedAt: new Date().toISOString(),
        };
      }

      const response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[RouteSuggestions] Anthropic API error: ${response.status} ${errorText}`);
        return {
          ...fallback,
          summary: "AI service temporarily unavailable. Please try again later.",
        };
      }

      const result = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };

      const text = result.content?.[0]?.text ?? "";
      const parsed = JSON.parse(text);

      return {
        summary: parsed.summary ?? "Analysis complete.",
        overallScore: Math.max(1, Math.min(10, Number(parsed.overallScore) || 5)),
        suggestions: (parsed.suggestions ?? []).map(
          (s: Record<string, unknown>) => ({
            type: String(s.type ?? "slow_segment"),
            segmentFrom: Number(s.segmentFrom ?? 0),
            segmentTo: Number(s.segmentTo ?? 0),
            description: String(s.description ?? ""),
            estimatedSavingsSeconds: Number(s.estimatedSavingsSeconds ?? 0),
            priority: ["high", "medium", "low"].includes(String(s.priority))
              ? String(s.priority)
              : "medium",
          }),
        ),
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[RouteSuggestions] Error:", error);
      return {
        ...fallback,
        summary: "Failed to parse AI response. Please try again.",
      };
    }
  }
}
