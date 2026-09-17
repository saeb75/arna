import { onboardingInputSchema } from "@glotmate/contracts";
import type { FastifyInstance } from "fastify";
import { createProgramForUser } from "./service.js";

export default async function onboardingRoutes(app: FastifyInstance) {
  app.post(
    "/onboarding",
    {
      preHandler: app.requireAuth,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 hour",
          keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip,
        },
      },
    },
    async (request, reply) => {
      const parsed = onboardingInputSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_input", issues: parsed.error.issues });
      }
      const program = await createProgramForUser(request.userId, parsed.data);
      return reply.code(201).send(program);
    },
  );
}
