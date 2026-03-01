import type { Repository } from "typeorm";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";

interface ListApiKeysQuery {
  page: number;
  limit: number;
  status?: "active" | "revoked";
}

export class ListApiKeysUseCase {
  constructor(
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
  ) {}

  async execute(query: ListApiKeysQuery) {
    const qb = this.licenseKeyRepo
      .createQueryBuilder("lk")
      .leftJoinAndSelect("lk.user", "user")
      .leftJoinAndSelect("lk.subscription", "sub")
      .leftJoin("sub.plan", "plan")
      .addSelect("plan.name")
      .orderBy("lk.createdAt", "DESC");

    if (query.status) {
      qb.andWhere("lk.status = :status", { status: query.status });
    }

    const total = await qb.getCount();
    const skip = (query.page - 1) * query.limit;
    qb.skip(skip).take(query.limit);

    const licenseKeys = await qb.getMany();

    const data = licenseKeys.map((lk) => ({
      id: lk.id,
      userId: lk.userId,
      userEmail: lk.user?.email || "",
      name: lk.subscription?.plan?.name || "License Key",
      keyPrefix: lk.keyPrefix,
      status: lk.status as "active" | "revoked",
      lastUsedAt: lk.lastUsedAt?.toISOString() || null,
      createdAt: lk.createdAt.toISOString(),
      requestsCount: lk.totalRequests,
    }));

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
