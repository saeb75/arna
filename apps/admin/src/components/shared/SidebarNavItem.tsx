"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Aktif öğe arka planı `layoutId` ile öğeler arasında KAYAR — tıklamada
 * yeniden çizilmez. Tek ortak layoutId, sidebar'da tek aktif olduğu için güvenli.
 */
export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  exact = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Kök gibi her yolun öneki olan href'ler yalnız tam eşleşmede aktif */
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
        active ? "text-sidebar-accent-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-sidebar-accent"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
      <Icon className="relative size-4" />
      <span className="relative">{label}</span>
    </Link>
  );
}
