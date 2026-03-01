import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { adminUsersController } from "./controllers/users.controller.js";
import { adminSubscriptionsController } from "./controllers/subscriptions.controller.js";
import { adminPlansController } from "./controllers/plans.controller.js";
import { adminLicensesController } from "./controllers/licenses.controller.js";
import { adminApiKeysController } from "./controllers/api-keys.controller.js";
import { adminAnalyticsController } from "./controllers/analytics.controller.js";
import { adminSettingsController } from "./controllers/settings.controller.js";

export const adminController: FastifyPluginAsyncZod = async (app) => {
  await app.register(adminUsersController, { prefix: "/users" });
  await app.register(adminSubscriptionsController, { prefix: "/subscriptions" });
  await app.register(adminPlansController, { prefix: "/plans" });
  await app.register(adminLicensesController, { prefix: "/licenses" });
  await app.register(adminApiKeysController, { prefix: "/api-keys" });
  await app.register(adminAnalyticsController, { prefix: "/analytics" });
  await app.register(adminSettingsController, { prefix: "/settings" });
};
