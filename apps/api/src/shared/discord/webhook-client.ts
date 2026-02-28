import { DISCORD_WEBHOOK_URL_PATTERN } from "../../modules/discord/constants.js";
import { AppError } from "../errors/index.js";

export class DiscordRateLimitError extends AppError {
  constructor(public readonly retryAfterMs: number) {
    super(`Discord rate limit hit. Retry after ${retryAfterMs}ms`, 429, "DISCORD_RATE_LIMIT");
    this.name = "DiscordRateLimitError";
  }
}

export class DiscordWebhookDeletedError extends AppError {
  constructor() {
    super("Discord webhook has been deleted", 404, "DISCORD_WEBHOOK_DELETED");
    this.name = "DiscordWebhookDeletedError";
  }
}

interface DiscordWebhookInfo {
  id: string;
  guildName: string | null;
  channelName: string | null;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
  thumbnail?: { url: string };
}

export function isValidWebhookUrl(url: string): boolean {
  return DISCORD_WEBHOOK_URL_PATTERN.test(url);
}

export async function validateWebhook(webhookUrl: string): Promise<DiscordWebhookInfo> {
  if (!isValidWebhookUrl(webhookUrl)) {
    throw new AppError("Invalid Discord webhook URL format", 422, "INVALID_WEBHOOK_URL");
  }

  const response = await fetch(webhookUrl);

  if (response.status === 404) {
    throw new DiscordWebhookDeletedError();
  }

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("Retry-After") || "5") * 1000;
    throw new DiscordRateLimitError(retryAfter);
  }

  if (!response.ok) {
    throw new AppError(
      `Discord webhook validation failed with status ${response.status}`,
      502,
      "WEBHOOK_VALIDATION_FAILED",
    );
  }

  const data = (await response.json()) as {
    id: string;
    guild_id?: string;
    channel_id?: string;
    name?: string;
  };

  return {
    id: data.id,
    guildName: data.name || null,
    channelName: null,
  };
}

export interface SendEmbedResult {
  success: boolean;
  webhookDeleted: boolean;
}

export async function sendEmbed(
  webhookUrl: string,
  embed: DiscordEmbed,
): Promise<SendEmbedResult> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (response.status === 404) {
    return { success: false, webhookDeleted: true };
  }

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("Retry-After") || "5") * 1000;
    throw new DiscordRateLimitError(retryAfter);
  }

  if (!response.ok) {
    return { success: false, webhookDeleted: false };
  }

  return { success: true, webhookDeleted: false };
}

export function extractWebhookId(webhookUrl: string): string {
  const match = webhookUrl.match(/\/webhooks\/(\d+)\//);
  return match?.[1] ?? "";
}
