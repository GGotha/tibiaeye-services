import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772317458083 implements MigrationInterface {
    name = 'InitialSchema1772317458083'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'suspended', 'banned')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "passwordHash" character varying(255) NOT NULL, "name" character varying(255), "avatar" character varying(500), "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "resetPasswordToken" character varying(255), "resetPasswordExpires" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "priceMonthly" numeric(10,2) NOT NULL, "priceYearly" numeric(10,2) NOT NULL, "maxCharacters" integer NOT NULL, "historyDays" integer NOT NULL, "apiRequestsPerDay" integer NOT NULL, "features" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'cancelled', 'past_due', 'trialing')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "planId" uuid NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'active', "externalId" character varying(255), "currentPeriodStart" TIMESTAMP NOT NULL, "currentPeriodEnd" TIMESTAMP NOT NULL, "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_fbdba4e2ac694cf8c9cecf4dc8" UNIQUE ("userId"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fbdba4e2ac694cf8c9cecf4dc8" ON "subscriptions" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."license_keys_status_enum" AS ENUM('active', 'revoked')`);
        await queryRunner.query(`CREATE TABLE "license_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "subscriptionId" uuid NOT NULL, "keyHash" character varying(255) NOT NULL, "keyPrefix" character varying(11) NOT NULL, "status" "public"."license_keys_status_enum" NOT NULL DEFAULT 'active', "lastUsedAt" TIMESTAMP, "totalRequests" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b2711aaaf68d41a34461591519f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_29be769407a8e35d542b59caec" ON "license_keys" ("keyPrefix") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b166ce5bf2e59f104b5fad9a56" ON "license_keys" ("subscriptionId") `);
        await queryRunner.query(`CREATE TABLE "characters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "name" character varying(50) NOT NULL, "world" character varying(50) NOT NULL, "level" integer, "vocation" character varying(50), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d731e05758f26b9315dac5e378" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f6aebdcab0b7e44ec9221d344e" ON "characters" ("name", "world") `);
        await queryRunner.query(`CREATE INDEX "IDX_7c1bf02092d401b55ecc243ef1" ON "characters" ("userId") `);
        await queryRunner.query(`CREATE TABLE "routes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" character varying(500), "userId" uuid NOT NULL, "characterId" uuid, "waypoints" jsonb NOT NULL DEFAULT '[]', "metadata" jsonb, "isPublic" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_76100511cdfa1d013c859f01d8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bb4cd0199dd9a8c1438d0bff91" ON "routes" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."sessions_status_enum" AS ENUM('active', 'paused', 'completed', 'crashed')`);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "characterId" uuid NOT NULL, "routeId" uuid, "huntLocation" character varying(255), "status" "public"."sessions_status_enum" NOT NULL DEFAULT 'active', "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "endedAt" TIMESTAMP WITH TIME ZONE, "initialLevel" integer, "initialExperience" bigint, "finalLevel" integer, "finalExperience" bigint, "totalKills" integer NOT NULL DEFAULT '0', "totalExperience" bigint NOT NULL DEFAULT '0', "totalLootValue" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8736d3b47c78175b920d4c8fe9" ON "sessions" ("status", "startedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d4576b76e79335c01361524f4" ON "sessions" ("characterId", "status") `);
        await queryRunner.query(`CREATE TABLE "kills" ("id" BIGSERIAL NOT NULL, "sessionId" uuid NOT NULL, "creatureName" character varying(100) NOT NULL, "experienceGained" integer, "positionX" integer, "positionY" integer, "positionZ" smallint, "killedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a942b5b49eb07d42cc127857da0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bf4d104ebda651fb76a9f19297" ON "kills" ("creatureName") `);
        await queryRunner.query(`CREATE INDEX "IDX_aa4980545dfb44229355b11389" ON "kills" ("sessionId", "killedAt") `);
        await queryRunner.query(`CREATE TABLE "loot" ("id" BIGSERIAL NOT NULL, "sessionId" uuid NOT NULL, "itemName" character varying(100) NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "estimatedValue" integer, "lootedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8954d04ebf92fe8fa1b38246c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c28eb2f67ccfea3716bec7307e" ON "loot" ("itemName") `);
        await queryRunner.query(`CREATE INDEX "IDX_8f22fe38ee94b994bde5a911b4" ON "loot" ("sessionId") `);
        await queryRunner.query(`CREATE TABLE "experience_snapshots" ("id" BIGSERIAL NOT NULL, "sessionId" uuid NOT NULL, "experience" bigint NOT NULL, "level" integer NOT NULL, "recordedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2f9e8886771df51a4b3f3dc6812" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_88aad7eea4859be6614b75d35f" ON "experience_snapshots" ("sessionId", "recordedAt") `);
        await queryRunner.query(`CREATE TABLE "position_logs" ("id" BIGSERIAL NOT NULL, "sessionId" uuid NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "z" smallint NOT NULL, "recordedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a024cf54ad7dc5b843134c4731b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cd51d898c56cb360074bf26bcc" ON "position_logs" ("sessionId", "recordedAt") `);
        await queryRunner.query(`CREATE TABLE "discord_integrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "label" character varying(100) NOT NULL, "webhookUrl" text NOT NULL, "webhookId" character varying(100) NOT NULL, "guildName" character varying(100), "channelName" character varying(100), "isActive" boolean NOT NULL DEFAULT true, "notificationPreferences" text NOT NULL, "lastNotifiedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_38c90853296966c6bb588348515" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ca391222de1965f1b3f5a4a718" ON "discord_integrations" ("userId", "isActive") `);
        await queryRunner.query(`CREATE TABLE "game_events" ("id" BIGSERIAL NOT NULL, "sessionId" uuid NOT NULL, "type" character varying(50) NOT NULL, "data" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_250946158c7913ba536add1e602" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_47c2ec31c87164b85b1c36f959" ON "game_events" ("sessionId", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_c9557054e3722900a45758a8ba" ON "game_events" ("sessionId", "type") `);
        await queryRunner.query(`CREATE TABLE "bot_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "characterId" uuid NOT NULL, "config" jsonb NOT NULL DEFAULT '{}', "version" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_560b0fe22c133c2b32c2fb7e66e" UNIQUE ("characterId"), CONSTRAINT "PK_1fe9dcbf0e671603945c02aac2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_560b0fe22c133c2b32c2fb7e66" ON "bot_configs" ("characterId") `);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7536cba909dd7584a4640cad7d5" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "license_keys" ADD CONSTRAINT "FK_69dfecee5b084241a201328fe79" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "license_keys" ADD CONSTRAINT "FK_b166ce5bf2e59f104b5fad9a562" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "characters" ADD CONSTRAINT "FK_7c1bf02092d401b55ecc243ef1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "routes" ADD CONSTRAINT "FK_bb4cd0199dd9a8c1438d0bff91d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "routes" ADD CONSTRAINT "FK_7d34a8399e9207e6595589be69e" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_bc43ed1d5e72df8017d77c8031e" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_f3170e3bb3fe0e5ec4da1870d18" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kills" ADD CONSTRAINT "FK_dfbdc52760bc6c311e1559552e8" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loot" ADD CONSTRAINT "FK_8f22fe38ee94b994bde5a911b40" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "experience_snapshots" ADD CONSTRAINT "FK_7f23f1775b3fd54a5d67105698b" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "position_logs" ADD CONSTRAINT "FK_03aa00f9d16cb0b833cd6e66d65" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "discord_integrations" ADD CONSTRAINT "FK_d93f173be81a2e479fd572015d5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_events" ADD CONSTRAINT "FK_9ebf46040fecf826d4287287cc9" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bot_configs" ADD CONSTRAINT "FK_560b0fe22c133c2b32c2fb7e66e" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bot_configs" DROP CONSTRAINT "FK_560b0fe22c133c2b32c2fb7e66e"`);
        await queryRunner.query(`ALTER TABLE "game_events" DROP CONSTRAINT "FK_9ebf46040fecf826d4287287cc9"`);
        await queryRunner.query(`ALTER TABLE "discord_integrations" DROP CONSTRAINT "FK_d93f173be81a2e479fd572015d5"`);
        await queryRunner.query(`ALTER TABLE "position_logs" DROP CONSTRAINT "FK_03aa00f9d16cb0b833cd6e66d65"`);
        await queryRunner.query(`ALTER TABLE "experience_snapshots" DROP CONSTRAINT "FK_7f23f1775b3fd54a5d67105698b"`);
        await queryRunner.query(`ALTER TABLE "loot" DROP CONSTRAINT "FK_8f22fe38ee94b994bde5a911b40"`);
        await queryRunner.query(`ALTER TABLE "kills" DROP CONSTRAINT "FK_dfbdc52760bc6c311e1559552e8"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_f3170e3bb3fe0e5ec4da1870d18"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_bc43ed1d5e72df8017d77c8031e"`);
        await queryRunner.query(`ALTER TABLE "routes" DROP CONSTRAINT "FK_7d34a8399e9207e6595589be69e"`);
        await queryRunner.query(`ALTER TABLE "routes" DROP CONSTRAINT "FK_bb4cd0199dd9a8c1438d0bff91d"`);
        await queryRunner.query(`ALTER TABLE "characters" DROP CONSTRAINT "FK_7c1bf02092d401b55ecc243ef1f"`);
        await queryRunner.query(`ALTER TABLE "license_keys" DROP CONSTRAINT "FK_b166ce5bf2e59f104b5fad9a562"`);
        await queryRunner.query(`ALTER TABLE "license_keys" DROP CONSTRAINT "FK_69dfecee5b084241a201328fe79"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7536cba909dd7584a4640cad7d5"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_560b0fe22c133c2b32c2fb7e66"`);
        await queryRunner.query(`DROP TABLE "bot_configs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c9557054e3722900a45758a8ba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_47c2ec31c87164b85b1c36f959"`);
        await queryRunner.query(`DROP TABLE "game_events"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ca391222de1965f1b3f5a4a718"`);
        await queryRunner.query(`DROP TABLE "discord_integrations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cd51d898c56cb360074bf26bcc"`);
        await queryRunner.query(`DROP TABLE "position_logs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_88aad7eea4859be6614b75d35f"`);
        await queryRunner.query(`DROP TABLE "experience_snapshots"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f22fe38ee94b994bde5a911b4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c28eb2f67ccfea3716bec7307e"`);
        await queryRunner.query(`DROP TABLE "loot"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aa4980545dfb44229355b11389"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bf4d104ebda651fb76a9f19297"`);
        await queryRunner.query(`DROP TABLE "kills"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d4576b76e79335c01361524f4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8736d3b47c78175b920d4c8fe9"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bb4cd0199dd9a8c1438d0bff91"`);
        await queryRunner.query(`DROP TABLE "routes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7c1bf02092d401b55ecc243ef1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f6aebdcab0b7e44ec9221d344e"`);
        await queryRunner.query(`DROP TABLE "characters"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b166ce5bf2e59f104b5fad9a56"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_29be769407a8e35d542b59caec"`);
        await queryRunner.query(`DROP TABLE "license_keys"`);
        await queryRunner.query(`DROP TYPE "public"."license_keys_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fbdba4e2ac694cf8c9cecf4dc8"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
        await queryRunner.query(`DROP TABLE "plans"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
