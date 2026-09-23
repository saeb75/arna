import type { FastifyInstance } from "fastify";
import { getAvatarSettings } from "./settings.js";

/**
 * Aktif avatar — YETKİLİ istemciler okur (web ders/roleplay sayfaları doğrudan;
 * mobil, WebView URL'ine `?avatar=<id>` eklemek için). Bilinçli karar: public
 * uç AÇILMADI — backend'de auth'suz tek veri ucu yok ve öyle kalıyor; embed
 * sayfası kimliği URL parametresinden alır (sır değil).
 */
export default async function avatarRoutes(app: FastifyInstance) {
  app.get("/avatar", { preHandler: app.requireAuth }, async () => {
    const { settings } = await getAvatarSettings();
    return { activeId: settings.activeId };
  });
}
