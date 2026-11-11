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
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:6560",
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

/**
 * Contracts'ta şeması OLMAYAN küçük bir cevabın yerinde denetimi tutmadığında servis bunu
 * fırlatır — `errorCode` onu Zod hatası gibi `invalid_response`a çevirir.
 */
export class InvalidResponseError extends Error {
  override name = "InvalidResponseError";
}

/** Backend'in `{ error: "kod" }` zarfından kodu çıkarır; yoksa genel kod döner. */
export function errorCode(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? `http_${err.response?.status ?? "network"}`;
  }
  if (err instanceof Error && (err.name === "ZodError" || err instanceof InvalidResponseError)) return "invalid_response";
  return "unknown";
}

/**
 * Hata gövdesinin kendisi (kod dışındaki alanlar: `report`, `issues`…) — controller'lar
 * axios'a dokunmadan 422/400 ayrıntısını okuyabilsin. Gövde yoksa null.
 */
export function errorData(err: unknown): Record<string, unknown> | null {
  if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object") {
    return err.response.data as Record<string, unknown>;
  }
  return null;
}
