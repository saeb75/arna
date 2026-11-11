import type { FastifyInstance } from "fastify";
import { resolveTutorForUser } from "../tutor/registry.js";

/**
 * Kullanıcının avatarı — YETKİLİ istemciler okur (web ders/roleplay sayfaları doğrudan;
 * mobil sahneyi kurmak için). Avatar artık kullanıcının ÖĞRETMENİNDEN gelir
 * (tutor/registry.ts); öğretmen kaydı hiç yoksa global `app_settings.avatar`
 * (eski davranış). Bilinçli karar: public uç AÇILMADI — backend'de auth'suz tek veri
 * ucu yok ve öyle kalıyor; embed sayfası kimliği URL parametresinden alır (sır değil).
 */
export default async function avatarRoutes(app: FastifyInstance) {
  app.get("/avatar", { preHandler: app.requireAuth }, async (request) => {
    const tutor = await resolveTutorForUser(request.userId);
    return { activeId: tutor.avatarId, tutorName: tutor.name };
  });
}
