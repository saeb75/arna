import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { env, isProd } from "./config/env.js";
import authPlugin from "./plugins/auth.js";
import healthRoutes from "./modules/health/routes.js";
import lessonRoutes from "./modules/lesson/routes.js";
import onboardingRoutes from "./modules/onboarding/routes.js";
import curriculumRoutes from "./modules/curriculum/routes.js";
import sessionRoutes from "./modules/session/routes.js";
import roleplayRoutes from "./modules/roleplay/routes.js";
import adminRoutes from "./modules/admin/routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: isProd
      ? true
      : { transport: undefined, level: "info" },
  });

  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(",").map((o) => o.trim()),
    credentials: true,
  });

  // Global taban limiti; AI uçları kendi daha sıkı limitlerini ayrıca koyar
  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
  });

  // STT ses yüklemeleri için (≤10 MB)
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024, files: 1 } });

  // API dokümantasyonu: statik openapi.yaml → Swagger UI (/docs)
  await app.register(swagger, {
    mode: "static",
    specification: {
      path: join(dirname(fileURLToPath(import.meta.url)), "../openapi.yaml"),
      baseDir: join(dirname(fileURLToPath(import.meta.url)), ".."),
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  await app.register(authPlugin);
  await app.register(healthRoutes);

  await app.register(onboardingRoutes, { prefix: "/v1" });
  await app.register(curriculumRoutes, { prefix: "/v1" });
  await app.register(lessonRoutes, { prefix: "/v1" });
  await app.register(sessionRoutes, { prefix: "/v1" });
  await app.register(roleplayRoutes, { prefix: "/v1" });
  await app.register(adminRoutes, { prefix: "/v1" });

  return app;
}
