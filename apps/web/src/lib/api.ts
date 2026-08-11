import { supabase } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Öğrencinin ana dili (BCP-47). Arayüz şu an tek dilli (Türkçe) olduğu için
 * sabit; i18n geldiğinde kullanıcıdan alınacak. Backend bu değere göre
 * parametrik çalışır — hiçbir yerde dile sabitlenmiş kod yoktur.
 */
export const DEFAULT_NATIVE_LANGUAGE = "tr";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

/** Auth'lu API isteği: Supabase access token'ını ekler; 401'de login'e yollar. */
export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    window.location.href = "/login";
    throw new ApiError(401, "no_session");
  }

  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);
  // FormData'da content-type'ı tarayıcı belirler (boundary)
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };

  if (res.status === 401) {
    window.location.href = "/login";
    throw new ApiError(401, "unauthorized");
  }
  if (!res.ok) throw new ApiError(res.status, body.error ?? `http_${res.status}`);
  return body;
}
