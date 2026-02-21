import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import type { DataSource, Repository, EntityTarget, ObjectLiteral } from "typeorm";
import { dataSource } from "../config/database.js";

declare module "fastify" {
  interface FastifyInstance {
    orm: DataSource;
    getRepository: <T extends ObjectLiteral>(entity: EntityTarget<T>) => Repository<T>;
  }
}

async function databasePlugin(fastify: FastifyInstance) {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
    fastify.log.info("Database connected");
  }

  fastify.decorate("orm", dataSource);
  fastify.decorate("getRepository", <T extends ObjectLiteral>(entity: EntityTarget<T>) => {
    return dataSource.getRepository(entity);
  });

  fastify.addHook("onClose", async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      fastify.log.info("Database connection closed");
    }
  });
}

export default fp(databasePlugin, {
  name: "database",
});
