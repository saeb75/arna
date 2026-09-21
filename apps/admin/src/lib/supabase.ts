import { createClient } from "@supabase/supabase-js";

/**
 * Tarayıcı Supabase istemcisi. Oturum localStorage'da, yenileme supabase-js'te
 * (`autoRefreshToken` varsayılan açık). Token'ı uygulama kodu hiçbir yerde okumaz
 * veya saklamaz — `api/index.ts` interceptor'ı her istekte buradan çeker.
 * Bu modülü yalnız `services/` ve `api/` import eder.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
