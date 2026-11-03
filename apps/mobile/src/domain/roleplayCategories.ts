import {
  Briefcase,
  ConciergeBell,
  HeartPulse,
  House,
  Plane,
  ShoppingBag,
  Sparkles,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react-native";
import { ROLEPLAY_CATEGORIES } from "@glotmate/contracts";
import { tr } from "../i18n/tr";

/**
 * Rol yapma kategorisi → raf etiketi, ikon ve kart gradyanının renk token'ları
 * (`colors.js` cat-*). Sunucudaki kategori serbest metin; listede olmayan
 * "Diğer" rafına düşer (contracts ROLEPLAY_CATEGORIES ile aynı sıra).
 */
export interface CategoryLook {
  key: string;
  label: string;
  icon: LucideIcon;
  from: string;
  to: string;
}

type Tokens = { from: string; to: string };
const LOOK: Record<string, { icon: LucideIcon } & Tokens> = {
  "Eating out": { icon: UtensilsCrossed, from: "cat-eat", to: "cat-eat-deep" },
  Travel: { icon: Plane, from: "cat-travel", to: "cat-travel-deep" },
  Shopping: { icon: ShoppingBag, from: "cat-shop", to: "cat-shop-deep" },
  Work: { icon: Briefcase, from: "cat-work", to: "cat-work-deep" },
  Health: { icon: HeartPulse, from: "cat-health", to: "cat-health-deep" },
  Social: { icon: Users, from: "cat-social", to: "cat-social-deep" },
  Housing: { icon: House, from: "cat-home", to: "cat-home-deep" },
  Services: { icon: ConciergeBell, from: "cat-service", to: "cat-service-deep" },
};
const OTHER = { icon: Sparkles, from: "cat-service", to: "cat-service-deep" };

/** Ham renkler `useThemeColors()`'tan çözülür — burada yalnız token adları */
export function categoryLook(category: string): CategoryLook {
  const look = LOOK[category] ?? OTHER;
  return {
    key: category,
    label: tr.roleplay.categories[category] ?? tr.roleplay.categories.other!,
    icon: look.icon,
    from: look.from,
    to: look.to,
  };
}

/** Raf sırası: sözleşmedeki sıra, bilinmeyenler sonda */
export function categoryOrder(category: string): number {
  const i = (ROLEPLAY_CATEGORIES as readonly string[]).indexOf(category);
  return i < 0 ? 99 : i;
}
