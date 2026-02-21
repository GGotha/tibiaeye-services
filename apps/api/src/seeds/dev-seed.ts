import "reflect-metadata";
import { DataSource } from "typeorm";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { UserEntity, UserRole, UserStatus } from "../entities/user.entity.js";
import { PlanEntity } from "../entities/plan.entity.js";
import { SubscriptionEntity } from "../entities/subscription.entity.js";
import { LicenseKeyEntity } from "../entities/license-key.entity.js";
import { CharacterEntity } from "../entities/character.entity.js";


const dataSource = new DataSource({
  type: "mysql",
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  username: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "root",
  database: process.env.DATABASE_NAME || "tibiaeye_development",
  entities: [UserEntity, PlanEntity, SubscriptionEntity, LicenseKeyEntity, CharacterEntity],
  synchronize: true,
  logging: true,
});

function generateLicenseKey(): string {
  const randomBytes = crypto.randomBytes(24);
  return `tm_${randomBytes.toString("base64url")}`;
}

async function seed() {
  console.log("Connecting to database...");
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(UserEntity);
  const planRepo = dataSource.getRepository(PlanEntity);
  const subscriptionRepo = dataSource.getRepository(SubscriptionEntity);
  const licenseKeyRepo = dataSource.getRepository(LicenseKeyEntity);
  const characterRepo = dataSource.getRepository(CharacterEntity);

  // Check if already seeded
  const existingUser = await userRepo.findOne({ where: { email: "dev@tibiaeye.com" } });
  if (existingUser) {
    console.log("Database already seeded. Showing existing data...");

    const licenseKey = await licenseKeyRepo.findOne({ where: { userId: existingUser.id } });
    const character = await characterRepo.findOne({ where: { userId: existingUser.id } });

    console.log("\n========================================");
    console.log("DEV CREDENTIALS");
    console.log("========================================");
    console.log(`Email: dev@tibiaeye.com`);
    console.log(`Password: dev123456`);
    console.log(`License Key Prefix: ${licenseKey?.keyPrefix}...`);
    console.log(`Character ID: ${character?.id}`);
    console.log(`Character Name: ${character?.name}`);
    console.log("========================================\n");

    await dataSource.destroy();
    return;
  }

  console.log("Creating plans...");

  // Create Plans
  const freePlan = planRepo.create({
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    maxCharacters: 1,
    historyDays: 7,
    apiRequestsPerDay: 100,
    features: ["1 character", "7 days history", "Basic analytics"],
    isActive: true,
  });

  const proPlan = planRepo.create({
    name: "Pro",
    priceMonthly: 9.90,
    priceYearly: 99.90,
    maxCharacters: 5,
    historyDays: 30,
    apiRequestsPerDay: 10000,
    features: ["5 characters", "30 days history", "Advanced analytics", "Live map", "Priority support"],
    isActive: true,
  });

  const enterprisePlan = planRepo.create({
    name: "Enterprise",
    priceMonthly: 29.90,
    priceYearly: 299.90,
    maxCharacters: 20,
    historyDays: 365,
    apiRequestsPerDay: 100000,
    features: ["20 characters", "1 year history", "All features", "API access", "Dedicated support"],
    isActive: true,
  });

  await planRepo.save([freePlan, proPlan, enterprisePlan]);

  console.log("Creating dev user...");

  // Create Dev User
  const passwordHash = await bcrypt.hash("dev123456", 10);
  const devUser = userRepo.create({
    email: "dev@tibiaeye.com",
    passwordHash,
    name: "Dev User",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  });
  await userRepo.save(devUser);

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash("admin123456", 10);
  const adminUser = userRepo.create({
    email: "admin@tibiaeye.com",
    passwordHash: adminPasswordHash,
    name: "Admin User",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  });
  await userRepo.save(adminUser);

  console.log("Creating subscription...");

  // Create Subscription for dev user
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const subscription = subscriptionRepo.create({
    userId: devUser.id,
    planId: proPlan.id,
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: nextYear,
    cancelAtPeriodEnd: false,
  });
  await subscriptionRepo.save(subscription);

  console.log("Generating license key...");

  // Generate License Key
  const rawKey = generateLicenseKey();
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keyPrefix = rawKey.substring(0, 11); // "tm_" + 8 chars

  const licenseKey = licenseKeyRepo.create({
    userId: devUser.id,
    subscriptionId: subscription.id,
    keyHash,
    keyPrefix,
    status: "active",
    totalRequests: 0,
  });
  await licenseKeyRepo.save(licenseKey);

  console.log("Creating test character...");

  // Create Test Character
  const character = characterRepo.create({
    userId: devUser.id,
    name: "Test Knight",
    world: "Antica",
    level: 150,
    vocation: "Elite Knight",
    isActive: true,
  });
  await characterRepo.save(character);

  console.log("\n========================================");
  console.log("SEED COMPLETED SUCCESSFULLY!");
  console.log("========================================");
  console.log("\nDEV USER:");
  console.log(`  Email: dev@tibiaeye.com`);
  console.log(`  Password: dev123456`);
  console.log(`  Plan: Pro (1 year)`);
  console.log("");
  console.log("ADMIN USER:");
  console.log(`  Email: admin@tibiaeye.com`);
  console.log(`  Password: admin123456`);
  console.log("");
  console.log("LICENSE KEY (use this in your Python bot .env):");
  console.log(`  TELEMETRY_API_KEY=${rawKey}`);
  console.log("");
  console.log("CHARACTER (use this in your Python bot .env):");
  console.log(`  CHARACTER_ID=${character.id}`);
  console.log(`  Name: ${character.name}`);
  console.log(`  World: ${character.world}`);
  console.log("========================================\n");

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
