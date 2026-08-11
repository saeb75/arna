import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { env } from "../config/env.js";

declare module "fastify" {
  interface FastifyRequest {
    /** Doğrulanmış Supabase kullanıcı id'si (auth.users.id) */
    userId: string;
  }
}

const hsSecret = env.SUPABASE_JWT_SECRET
  ? new TextEncoder().encode(env.SUPABASE_JWT_SECRET)
  : null;

// Yeni Supabase projeleri asimetrik anahtar kullanır → JWKS
const jwks = createRemoteJWKSet(
  new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
);

async function verifyToken(token: string): Promise<JWTPayload> {
  if (hsSecret) {
    const { payload } = await jwtVerify(token, hsSecret, { audience: "authenticated" });
    return payload;
  }
  const { payload } = await jwtVerify(token, jwks, { audience: "authenticated" });
  return payload;
}

async function authPlugin(app: FastifyInstance) {
  app.decorateRequest("userId", "");

  app.decorate(
    "requireAuth",
    async function (request: FastifyRequest, reply: FastifyReply) {
      const header = request.headers.authorization;
      if (!header?.startsWith("Bearer ")) {
        return reply.code(401).send({ error: "missing_token" });
      }
      try {
        const payload = await verifyToken(header.slice(7));
        if (!payload.sub) throw new Error("no sub");
        request.userId = payload.sub;
      } catch {
        return reply.code(401).send({ error: "invalid_token" });
      }
    },
  );
}

declare module "fastify" {
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(authPlugin, { name: "auth" });
