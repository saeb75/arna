import type { FastifyInstance } from "fastify";
import { getAdminLessonMatrix } from "./queries.js";

/**
 * ADMİN UÇLARI — yalnız `app_metadata.role === "admin"` (plugins/auth.ts →
 * `requireAdmin`). Panel (apps/admin) dışında tüketicisi yok; kullanıcı
 * istemcileri bu uçları bilmez.
 *
 * Faz 2: salt okunur matris. Üret/yayınla aksiyonları (Faz 3) buraya
 * `POST /admin/lessons/:id/...` olarak gelecek; üretim fonksiyonları zaten
 * `lesson/layers.ts`'te.
 */
export default async function adminRoutes(app: FastifyInstance) {
  app.get("/admin/lessons", { preHandler: app.requireAdmin }, async () => {
    return await getAdminLessonMatrix();
  });
}
