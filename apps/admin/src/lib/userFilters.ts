import type { AdminUser } from "@glotmate/contracts";
import type { UserFilters } from "@/stores/useUsersStore";

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
    if (f.onlyAdmins && !u.isAdmin) return false;
    if (f.onlyActive && !isActive(u, now)) return false;
    if (q && !`${u.email ?? ""} ${u.displayName ?? ""} ${u.id}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export interface UsersSummary {
  total: number;
  withProfile: number;
  active30d: number;
  admins: number;
  totalCostUsd: number;
}

export function summarizeUsers(users: AdminUser[], now = Date.now()): UsersSummary {
  let withProfile = 0, active30d = 0, admins = 0, totalCostUsd = 0;
  for (const u of users) {
    if (u.hasProfile) withProfile++;
    if (isActive(u, now)) active30d++;
    if (u.isAdmin) admins++;
    totalCostUsd += u.llmCostUsd;
  }
  return { total: users.length, withProfile, active30d, admins, totalCostUsd };
}
