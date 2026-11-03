import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabase";

/**
 * TEK axios instance — CLAUDE.md sözleşmesi:
 *   · Bileşenler bu modülü import EDEMEZ; yalnız controller'lar kullanır.
 *   · JWT'yi interceptor ekler; hiçbir controller elle header kurmaz.
 *   · 401 tek yerde yakalanır: AuthController.recover() oturumu tazelemeyi dener,
 *     olmazsa yeni bir misafirle kapıdan geçer (misafir-önce modeli: login ekranı yok).
 */
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:6560",
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    if (err.response?.status === 401) {
      // Döngüsel import olmasın diye dinamik: controller → api → controller
      const { AuthController } = await import("../controllers/AuthController");
      void AuthController.recover();
    }
    throw err;
  },
);

/** Backend'in `{ error: "kod" }` zarfından kodu çıkarır; yoksa genel kod döner. */
export function errorCode(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? `http_${err.response?.status ?? "network"}`;
  }
  return "unknown";
}

/**
 * 402 `quota_exceeded` → hangi kota ("lesson" | "roleplay"); başka hata → null.
 * Oturum açan iki uç bunu döner — çağıran paywall'ı açar.
 */
export function quotaKindOf(err: unknown): "lesson" | "roleplay" | null {
  if (!axios.isAxiosError(err) || err.response?.status !== 402) return null;
  const kind = (err.response.data as { kind?: string } | undefined)?.kind;
  return kind === "lesson" || kind === "roleplay" ? kind : null;
}
