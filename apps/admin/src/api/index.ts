import axios, { AxiosError } from "axios";
import { supabase } from "@/lib/supabase";

/**
 * TEK axios instance — apps/mobile `src/api/index.ts`'in birebir portu.
 *   · Bileşenler ve controller'lar bu modülü import EDEMEZ; yalnız `services/`.
 *   · JWT'yi interceptor ekler; hiçbir servis elle header kurmaz.
 *   · 401 tek yerde yakalanır: authStore temizlenir, rota kapısı login'e yönlendirir.
 *     403 (rol yok) oturumu DÜŞÜRMEZ — token geçerli, yetki yok; panel Forbidden gösterir.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:6566",
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
      // Döngüsel import olmasın diye dinamik: store → controller → service → api → store
      const { useAuthStore } = await import("@/stores/useAuthStore");
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
  if (err instanceof Error && err.name === "ZodError") return "invalid_response";
  return "unknown";
}
