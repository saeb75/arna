"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Ana bölüm sekmeleri: Dersler | Roleplay. İki liste sayfasının tepesinde durur;
 * oyun/ders İÇİNDE gösterilmez — oturum sırasında başka bölüme kaçış, akışın
 * "bitiren yalnız butondur" kuralını sessizce deler.
 */
const TABS = [
  { href: "/lessons", label: "Dersler" },
  { href: "/roleplay", label: "Roleplay" },
] as const;

export function SectionTabs() {
  const pathname = usePathname();
  return (
    <nav className="mb-4 flex gap-1 rounded-lg bg-muted p-1" aria-label="Bölümler">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
