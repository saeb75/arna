import { useMeStore } from "../stores/useMeStore";
import { useProStore } from "../stores/useProStore";

/** Pro mu: sunucunun kararı YA DA mağazanın anlık durumu (satın alma anında ekran hemen açılsın). */
export function usePro(): boolean {
  const server = useMeStore((s) => s.me?.entitlement.isPro ?? false);
  const store = useProStore((s) => s.storeActive);
  return server || store;
}
