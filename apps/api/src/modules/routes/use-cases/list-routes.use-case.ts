import type { Repository } from "typeorm";
import { RouteEntity } from "../../../entities/route.entity.js";
import type { Route } from "../schemas.js";

export class ListRoutesUseCase {
  constructor(private readonly routeRepo: Repository<RouteEntity>) {}

  async execute(userId: string): Promise<Route[]> {
    const routes = await this.routeRepo.find({
      where: { userId },
      order: { updatedAt: "DESC" },
    });

    return routes.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      userId: r.userId,
      characterId: r.characterId,
      waypoints: r.waypoints,
      metadata: r.metadata,
      isPublic: r.isPublic,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }
}
