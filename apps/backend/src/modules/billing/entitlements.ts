import type { Entitlement } from "@glotmate/contracts";
import { eq } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { userEntitlements } from "../../db/schema.js";

/**
 * ABONELİK GÖRÜNÜMÜ — RevenueCat önbelleği + admin tanıması.
 *
 * Doğruluk kaynağı mağaza (RevenueCat). Burada tutulan satır yalnız bir önbellek:
 * oturum açan uçlar her istekte RC'ye gitmesin diye 15 dk taze sayılır. Satın
 * almadan hemen sonra istemci `POST /me/entitlement/refresh` çağırır (zorla
 * doğrulama) — kullanıcı "satın aldım ama hâlâ kilitli" görmez.
 *
 * RC ağı düşerse SON BİLİNEN değer kullanılır: bir ağ hatası ödeyen kullanıcıyı
 * kilitlemez, ödemeyeni de açmaz.
 */

const STALE_MS = 15 * 60 * 1000;
const RC_TIMEOUT_MS = 2500;

/** Süresiz admin tanımasının işareti — null "tanıma yok" demek, o yüzden uzak tarih */
export const ADMIN_GRANT_FOREVER = new Date("9999-12-31T00:00:00Z");

export type EntitlementRow = typeof userEntitlements.$inferSelect;

interface RcEntitlement {
  expires_date: string | null;
  product_identifier?: string;
}

interface RcSubscriberResponse {
  subscriber?: { entitlements?: Record<string, RcEntitlement> };
}

/** RevenueCat REST — anahtar yoksa null (doğrulama kapalı) */
async function fetchFromRevenueCat(
  userId: string,
): Promise<{ active: boolean; productId: string | null; expiresAt: Date | null } | null> {
  if (!env.REVENUECAT_SECRET_KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), RC_TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${env.REVENUECAT_SECRET_KEY}`, Accept: "application/json" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`revenuecat ${res.status}`);
    const body = (await res.json()) as RcSubscriberResponse;
    const ent = body.subscriber?.entitlements?.[env.REVENUECAT_ENTITLEMENT_ID];
    if (!ent) return { active: false, productId: null, expiresAt: null };
    const expiresAt = ent.expires_date ? new Date(ent.expires_date) : null;
    return {
      active: expiresAt === null || expiresAt.getTime() > Date.now(),
      productId: ent.product_identifier ?? null,
      expiresAt,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function readRow(userId: string): Promise<EntitlementRow | null> {
  const [row] = await db.select().from(userEntitlements).where(eq(userEntitlements.userId, userId)).limit(1);
  return row ?? null;
}

/** Mağaza tarafını yazar; admin tanımasına DOKUNMAZ (iki kaynak birbirini ezmez) */
export async function writeStoreState(
  userId: string,
  state: { active: boolean; productId: string | null; expiresAt: Date | null },
): Promise<EntitlementRow> {
  const now = new Date();
  const [row] = await db
    .insert(userEntitlements)
    .values({
      userId,
      rcActive: state.active,
      rcProductId: state.productId,
      rcExpiresAt: state.expiresAt,
      checkedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userEntitlements.userId,
      set: {
        rcActive: state.active,
        rcProductId: state.productId,
        rcExpiresAt: state.expiresAt,
        checkedAt: now,
        updatedAt: now,
      },
    })
    .returning();
  return row!;
}

export async function setAdminGrant(userId: string, until: Date | null): Promise<EntitlementRow> {
  const now = new Date();
  const [row] = await db
    .insert(userEntitlements)
    .values({ userId, adminGrantUntil: until, updatedAt: now })
    .onConflictDoUpdate({
      target: userEntitlements.userId,
      set: { adminGrantUntil: until, updatedAt: now },
    })
    .returning();
  return row!;
}

/** Satırdan görünüm — saf */
export function viewOf(row: EntitlementRow | null, now = new Date()): Entitlement & {
  rcActive: boolean;
  adminGranted: boolean;
} {
  const rcActive = !!row?.rcActive && (!row.rcExpiresAt || row.rcExpiresAt.getTime() > now.getTime());
  const adminGranted = !!row?.adminGrantUntil && row.adminGrantUntil.getTime() > now.getTime();
  if (rcActive) {
    return {
      isPro: true,
      source: "revenuecat",
      productId: row!.rcProductId,
      expiresAt: row!.rcExpiresAt?.toISOString() ?? null,
      rcActive,
      adminGranted,
    };
  }
  if (adminGranted) {
    const forever = row!.adminGrantUntil!.getTime() >= ADMIN_GRANT_FOREVER.getTime();
    return {
      isPro: true,
      source: "admin",
      productId: null,
      expiresAt: forever ? null : row!.adminGrantUntil!.toISOString(),
      rcActive,
      adminGranted,
    };
  }
  return { isPro: false, source: null, productId: null, expiresAt: null, rcActive, adminGranted };
}

/**
 * Kullanıcının Pro durumu. `force` → RC'ye zorla git (satın alma sonrası).
 * Aksi hâlde satır 15 dk'dan eskiyse ve anahtar varsa yeniden doğrular.
 */
export async function getEntitlement(
  userId: string,
  opts: { force?: boolean } = {},
): Promise<{ entitlement: Entitlement; row: EntitlementRow | null }> {
  let row = await readRow(userId);
  const stale = !row?.checkedAt || Date.now() - row.checkedAt.getTime() > STALE_MS;
  if (env.REVENUECAT_SECRET_KEY && (opts.force || stale)) {
    try {
      const state = await fetchFromRevenueCat(userId);
      if (state) row = await writeStoreState(userId, state);
    } catch (err) {
      console.warn(`[billing] RevenueCat doğrulaması başarısız (${userId}) — son bilinen değer kullanılıyor:`, err);
    }
  }
  const { rcActive: _rc, adminGranted: _ag, ...entitlement } = viewOf(row);
  return { entitlement, row };
}
