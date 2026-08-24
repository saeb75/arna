import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabase";

/**
 * TEK axios instance — CLAUDE.md sözleşmesi:
 *   · Bileşenler bu modülü import EDEMEZ; yalnız controller'lar kullanır.
 *   · JWT'yi interceptor ekler; hiçbir controller elle header kurmaz.
 *   · 401 tek yerde yakalanır: authStore temizlenir, _layout login'e yönlendirir.
 */
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
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
      // Döngüsel import olmasın diye dinamik: store → controller → api → store
      const { useAuthStore } = await import("../stores/useAuthStore");
      useAuthStore.getState().clear();
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
