import type { Repository } from "typeorm";
import { RouteEntity } from "../../../entities/route.entity.js";
import { AppError } from "../../../shared/errors/index.js";

export class DeleteRouteUseCase {
  constructor(private readonly routeRepo: Repository<RouteEntity>) {}

  async execute(userId: string, routeId: string): Promise<{ message: string }> {
    const route = await this.routeRepo.findOne({
      where: { id: routeId, userId },
    });

    if (!route) {
      throw new AppError("Route not found", 404);
    }

    await this.routeRepo.remove(route);

    return { message: "Route deleted successfully" };
  }
}
