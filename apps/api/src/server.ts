import "reflect-metadata";
import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`API docs available at http://localhost:${env.PORT}/api/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
