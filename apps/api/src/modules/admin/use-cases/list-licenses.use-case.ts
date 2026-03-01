import type { Repository } from "typeorm";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";

interface ListLicensesQuery {
  page: number;
  limit: number;
  status?: "active" | "expired" | "revoked";
  search?: string;
  expiringWithinDays?: number;
}

export class ListLicensesUseCase {
  constructor(
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
  ) {}

  async execute(query: ListLicensesQuery) {
    const qb = this.licenseKeyRepo
      .createQueryBuilder("lk")
      .leftJoinAndSelect("lk.user", "user")
      .leftJoinAndSelect("lk.subscription", "sub")
      .orderBy("lk.createdAt", "DESC");

    if (query.search) {
      qb.andWhere(
        "(user.email ILIKE :search OR user.name ILIKE :search)",
        { search: `%${query.search}%` },
      );
    }

    if (query.status === "revoked") {
      qb.andWhere("lk.status = :status", { status: "revoked" });
    } else if (query.status === "expired") {
      qb.andWhere("lk.status = :status", { status: "active" });
      qb.andWhere("sub.currentPeriodEnd < NOW()");
    } else if (query.status === "active") {
      qb.andWhere("lk.status = :status", { status: "active" });
      qb.andWhere("sub.currentPeriodEnd >= NOW()");
    }

    if (query.expiringWithinDays) {
      qb.andWhere("lk.status = :activeStatus", { activeStatus: "active" });
      qb.andWhere("sub.currentPeriodEnd >= NOW()");
      qb.andWhere("sub.currentPeriodEnd <= NOW() + :interval::interval", {
        interval: `${query.expiringWithinDays} days`,
      });
    }

    const total = await qb.getCount();
    const skip = (query.page - 1) * query.limit;
    qb.skip(skip).take(query.limit);

    const licenseKeys = await qb.getMany();
    const now = new Date();

    const data = licenseKeys.map((lk) => {
      const expiresAt = lk.subscription?.currentPeriodEnd;
      const isExpired = expiresAt && new Date(expiresAt) < now;
      const computedStatus: "active" | "expired" | "revoked" =
        lk.status === "revoked" ? "revoked" : isExpired ? "expired" : "active";

      return {
        id: lk.id,
        userId: lk.userId,
        userEmail: lk.user?.email || "",
        userName: lk.user?.name || null,
        keyPrefix: lk.keyPrefix,
        status: computedStatus,
        expiresAt: expiresAt?.toISOString() || now.toISOString(),
        createdAt: lk.createdAt.toISOString(),
        lastUsedAt: lk.lastUsedAt?.toISOString() || null,
        activationsCount: lk.totalRequests,
        maxActivations: 1,
      };
    });

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
