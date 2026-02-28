import type { Repository } from "typeorm";
import { RouteEntity } from "../../../entities/route.entity.js";
import { AppError } from "../../../shared/errors/index.js";
import type { UpdateRouteInput, Route } from "../schemas.js";

export class UpdateRouteUseCase {
  constructor(private readonly routeRepo: Repository<RouteEntity>) {}

  async execute(userId: string, routeId: string, input: UpdateRouteInput): Promise<Route> {
    const route = await this.routeRepo.findOne({
      where: { id: routeId, userId },
    });

    if (!route) {
      throw new AppError("Route not found", 404);
    }

    if (input.name !== undefined) route.name = input.name;
    if (input.description !== undefined) route.description = input.description;
    if (input.waypoints !== undefined) route.waypoints = input.waypoints;
    if (input.characterId !== undefined) route.characterId = input.characterId;
    if (input.isPublic !== undefined) route.isPublic = input.isPublic;

    const saved = await this.routeRepo.save(route);

    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      userId: saved.userId,
      characterId: saved.characterId,
      waypoints: saved.waypoints,
      metadata: saved.metadata,
      isPublic: saved.isPublic,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    };
  }
}
