import type { Repository } from "typeorm";
import { RouteEntity } from "../../../entities/route.entity.js";
import { AppError } from "../../../shared/errors/index.js";
import type { Route } from "../schemas.js";

export class GetRouteUseCase {
  constructor(private readonly routeRepo: Repository<RouteEntity>) {}

  async execute(userId: string, routeId: string): Promise<Route> {
    const route = await this.routeRepo.findOne({
      where: { id: routeId, userId },
    });

    if (!route) {
      throw new AppError("Route not found", 404);
    }

    return {
      id: route.id,
      name: route.name,
      description: route.description,
      userId: route.userId,
      characterId: route.characterId,
      waypoints: route.waypoints,
      metadata: route.metadata,
      isPublic: route.isPublic,
      createdAt: route.createdAt.toISOString(),
      updatedAt: route.updatedAt.toISOString(),
    };
  }
}
