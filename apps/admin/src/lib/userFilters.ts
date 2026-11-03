import type { AdminUser } from "@glotmate/contracts";
import type { UserFilters, UserSort } from "@/stores/useUsersStore";

/** Saf süzme/özet — React'sız; `scripts/test-user-filters.ts` ile sınanır. */
export const ACTIVE_WINDOW_MS = 30 * 24 * 3600 * 1000;

export function lastActivity(u: AdminUser): string | null {
  const a = u.lastSignInAt ? new Date(u.lastSignInAt).getTime() : 0;
  const b = u.lastSessionAt ? new Date(u.lastSessionAt).getTime() : 0;
  const t = Math.max(a, b);
  return t ? new Date(t).toISOString() : null;
}

export function isActive(u: AdminUser, now = Date.now()): boolean {
  const t = lastActivity(u);
  return t !== null && now - new Date(t).getTime() <= ACTIVE_WINDOW_MS;
}

export function applyUserFilters(users: AdminUser[], f: UserFilters, now = Date.now()): AdminUser[] {
  const q = f.q.trim().toLowerCase();
  return users.filter((u) => {
    if (f.level !== "all" && u.cefrLevel !== f.level) return false;
    if (f.plan === "pro" && !u.isPro) return false;
    if (f.plan === "free" && u.isPro) return false;
    if (f.account === "guest" && !u.isAnonymous) return false;
    if (f.account === "registered" && u.isAnonymous) return false;
    if (f.onlyAdmins && !u.isAdmin) return false;
    if (f.onlyActive && !isActive(u, now)) return false;
    if (q && !`${u.email ?? ""} ${u.displayName ?? ""} ${u.id}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

/**
 * Sıralama kararlı; eşitlikte kayıt tarihi (yeni önce). "Son aktiflik"te hiç
 * aktif olmamış hesaplar en sona düşer — listenin başı canlı kullanıcılar.
 */
export function sortUsers(users: AdminUser[], sort: UserSort): AdminUser[] {
  const time = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);
  const newest = (a: AdminUser, b: AdminUser) => time(b.createdAt) - time(a.createdAt);
  const out = [...users];
  switch (sort) {
    case "active":
      return out.sort((a, b) => time(lastActivity(b)) - time(lastActivity(a)) || newest(a, b));
    case "newest":
      return out.sort(newest);
    case "cost":
      return out.sort((a, b) => b.llmCostUsd - a.llmCostUsd || newest(a, b));
    case "sessions":
      return out.sort((a, b) => b.sessionCount - a.sessionCount || newest(a, b));
    case "email":
      return out.sort((a, b) => {
        // E-postasız (misafir) hesaplar alfabetik listenin sonunda
        if (!a.email && !b.email) return newest(a, b);
        if (!a.email) return 1;
        if (!b.email) return -1;
        return a.email.localeCompare(b.email, "en");
      });
  }
}

export interface UsersSummary {
  total: number;
  withProfile: number;
  active30d: number;
  admins: number;
  guests: number;
  pro: number;
  totalCostUsd: number;
}

export function summarizeUsers(users: AdminUser[], now = Date.now()): UsersSummary {
  let withProfile = 0, active30d = 0, admins = 0, guests = 0, pro = 0, totalCostUsd = 0;
  for (const u of users) {
    if (u.hasProfile) withProfile++;
    if (isActive(u, now)) active30d++;
    if (u.isAdmin) admins++;
    if (u.isAnonymous) guests++;
    if (u.isPro) pro++;
    totalCostUsd += u.llmCostUsd;
  }
  return { total: users.length, withProfile, active30d, admins, guests, pro, totalCostUsd };
}
