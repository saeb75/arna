import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { env } from "../config/env.js";

declare module "fastify" {
  interface FastifyRequest {
    /** Doğrulanmış Supabase kullanıcı id'si (auth.users.id) */
    userId: string;
    /**
     * JWT `app_metadata.role === "admin"`. Rol Supabase tarafında atanır
     * (`auth.users.raw_app_meta_data`), kullanıcı kendi değiştiremez —
     * `user_metadata`nın aksine. Tek yetki kaynağı; DB'de rol kolonu YOK.
     */
    isAdmin: boolean;
  }
}

/** Supabase access token'ındaki `app_metadata` bloğu (yalnız sunucu yazar) */
interface SupabaseClaims extends JWTPayload {
  app_metadata?: { role?: unknown };
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
  app.decorateRequest("isAdmin", false);

  const requireAuth = async function (request: FastifyRequest, reply: FastifyReply) {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return reply.code(401).send({ error: "missing_token" });
    }
    try {
      const payload = (await verifyToken(header.slice(7))) as SupabaseClaims;
      if (!payload.sub) throw new Error("no sub");
      request.userId = payload.sub;
      request.isAdmin = payload.app_metadata?.role === "admin";
    } catch {
      return reply.code(401).send({ error: "invalid_token" });
    }
  };

  app.decorate("requireAuth", requireAuth);

  /**
   * Admin paneli uçları için: geçerli token + admin rolü. Rolsüz kullanıcı 403
   * alır (401 değil — token geçerli, yetki yok; istemci oturumu düşürmez).
   */
  app.decorate("requireAdmin", async function (request: FastifyRequest, reply: FastifyReply) {
    await requireAuth(request, reply);
    if (reply.sent) return;
    if (!request.isAdmin) return reply.code(403).send({ error: "forbidden" });
  });
}

declare module "fastify" {
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(authPlugin, { name: "auth" });
