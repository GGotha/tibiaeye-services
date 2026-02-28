import type { Repository } from "typeorm";
import { RouteEntity } from "../../../entities/route.entity.js";
import type { CreateRouteInput, Route } from "../schemas.js";

export class CreateRouteUseCase {
  constructor(private readonly routeRepo: Repository<RouteEntity>) {}

  async execute(userId: string, input: CreateRouteInput): Promise<Route> {
    const route = this.routeRepo.create({
      name: input.name,
      description: input.description ?? null,
      userId,
      characterId: input.characterId ?? null,
      waypoints: input.waypoints,
      isPublic: input.isPublic ?? false,
    });

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
