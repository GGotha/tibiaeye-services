import type { Repository } from "typeorm";
import { SessionEntity, SessionStatus } from "../../../entities/session.entity.js";

export class GetBotsOnlineUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
  ) {}

  async execute() {
    const count = await this.sessionRepo.count({
      where: { status: SessionStatus.ACTIVE },
    });

    // Peak is heuristic: current count (no historical tracking)
    return {
      count,
      peak: count,
    };
  }
}
