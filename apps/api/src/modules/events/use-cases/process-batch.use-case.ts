import type { Repository } from "typeorm";
import { SessionEntity, SessionStatus } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { KillEntity } from "../../../entities/kill.entity.js";
import { LootEntity } from "../../../entities/loot.entity.js";
import { ExperienceSnapshotEntity } from "../../../entities/experience-snapshot.entity.js";
import { GameEventEntity } from "../../../entities/game-event.entity.js";
import { NotFoundError, ForbiddenError, AppError } from "../../../shared/errors/index.js";
import type { BatchEventsInput, BatchResult, Event } from "../schemas.js";

export class ProcessBatchUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly killRepo: Repository<KillEntity>,
    private readonly lootRepo: Repository<LootEntity>,
    private readonly experienceRepo: Repository<ExperienceSnapshotEntity>,
    private readonly gameEventRepo: Repository<GameEventEntity>,
  ) {}

  async execute(userId: string, input: BatchEventsInput): Promise<BatchResult> {
    // Verify session exists and belongs to user
    const session = await this.sessionRepo.findOne({
      where: { id: input.sessionId },
      relations: ["character"],
    });

    if (!session) {
      throw new NotFoundError("Session not found");
    }

    if (session.character.userId !== userId) {
      throw new ForbiddenError("You do not own this session");
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new AppError("Session is not active", 400);
    }

    let processed = 0;
    let errors = 0;

    const kills: KillEntity[] = [];
    const loots: LootEntity[] = [];
    const snapshots: ExperienceSnapshotEntity[] = [];
    const gameEvents: GameEventEntity[] = [];

    for (const event of input.events) {
      try {
        this.processEvent(session.id, event, kills, loots, snapshots, gameEvents);
        processed++;
      } catch {
        errors++;
      }
    }

    // Batch insert
    if (kills.length > 0) {
      await this.killRepo.save(kills);
    }

    if (loots.length > 0) {
      await this.lootRepo.save(loots);
    }

    if (snapshots.length > 0) {
      await this.experienceRepo.save(snapshots);
    }

    if (gameEvents.length > 0) {
      await this.gameEventRepo.save(gameEvents);
    }

    // Update session totals
    await this.updateSessionTotals(session.id, kills, loots);

    return { processed, errors };
  }

  private processEvent(
    sessionId: string,
    event: Event,
    kills: KillEntity[],
    loots: LootEntity[],
    snapshots: ExperienceSnapshotEntity[],
    gameEvents: GameEventEntity[],
  ): void {
    switch (event.type) {
      case "kill": {
        const kill = new KillEntity();
        kill.sessionId = sessionId;
        kill.creatureName = event.creatureName;
        kill.experienceGained = event.experienceGained ?? null;
        kill.positionX = event.positionX ?? null;
        kill.positionY = event.positionY ?? null;
        kill.positionZ = event.positionZ ?? null;
        if (event.timestamp) {
          kill.killedAt = new Date(event.timestamp);
        }
        kills.push(kill);
        break;
      }

      case "loot": {
        const loot = new LootEntity();
        loot.sessionId = sessionId;
        loot.itemName = event.itemName;
        loot.quantity = event.quantity;
        loot.estimatedValue = event.estimatedValue ?? null;
        if (event.timestamp) {
          loot.lootedAt = new Date(event.timestamp);
        }
        loots.push(loot);
        break;
      }

      case "experience": {
        const snapshot = new ExperienceSnapshotEntity();
        snapshot.sessionId = sessionId;
        snapshot.experience = event.experience;
        snapshot.level = event.level;
        if (event.timestamp) {
          snapshot.recordedAt = new Date(event.timestamp);
        }
        snapshots.push(snapshot);
        break;
      }

      case "death": {
        const gameEvent = new GameEventEntity();
        gameEvent.sessionId = sessionId;
        gameEvent.type = "death";
        gameEvent.data = {
          killer: event.killer ?? null,
          positionX: event.positionX ?? null,
          positionY: event.positionY ?? null,
          positionZ: event.positionZ ?? null,
        };
        if (event.timestamp) {
          gameEvent.createdAt = new Date(event.timestamp);
        }
        gameEvents.push(gameEvent);
        break;
      }

      case "level_up": {
        const gameEvent = new GameEventEntity();
        gameEvent.sessionId = sessionId;
        gameEvent.type = "level_up";
        gameEvent.data = { newLevel: event.newLevel };
        if (event.timestamp) {
          gameEvent.createdAt = new Date(event.timestamp);
        }
        gameEvents.push(gameEvent);
        break;
      }

      case "refill": {
        const gameEvent = new GameEventEntity();
        gameEvent.sessionId = sessionId;
        gameEvent.type = "refill";
        gameEvent.data = {
          potionsBought: event.potionsBought ?? null,
          goldSpent: event.goldSpent ?? null,
        };
        if (event.timestamp) {
          gameEvent.createdAt = new Date(event.timestamp);
        }
        gameEvents.push(gameEvent);
        break;
      }
    }
  }

  private async updateSessionTotals(
    sessionId: string,
    kills: KillEntity[],
    loots: LootEntity[],
  ): Promise<void> {
    const totalXp = kills.reduce((sum, k) => sum + (k.experienceGained || 0), 0);
    const totalLoot = loots.reduce((sum, l) => sum + (l.estimatedValue || 0) * l.quantity, 0);

    await this.sessionRepo
      .createQueryBuilder()
      .update(SessionEntity)
      .set({
        totalKills: () => `totalKills + ${kills.length}`,
        totalExperience: () => `totalExperience + ${totalXp}`,
        totalLootValue: () => `totalLootValue + ${totalLoot}`,
      })
      .where("id = :id", { id: sessionId })
      .execute();
  }
}
