"use client";

import { AudioLines, BookOpen, MessagesSquare, PersonStanding, Users } from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";
import { SidebarNavItem } from "@/components/shared/SidebarNavItem";
import { UserMenu } from "@/components/shared/UserMenu";

const NAV = [
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/users", label: "Users", icon: Users },
  { href: "/sessions", label: "Sessions", icon: MessagesSquare },
];

/** Ayarlar ayrı grup: avatar ve ses BİRER sayfa (tek karışık ayar sayfası yerine) */
const SETTINGS_NAV = [
  { href: "/settings/avatar", label: "Avatar", icon: PersonStanding },
  { href: "/settings/voice", label: "Voice", icon: AudioLines },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar px-3 py-4">
      <div className="px-2 pb-6">
        <BrandMark />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
        <p className="mt-5 mb-1 px-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Settings</p>
        {SETTINGS_NAV.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
      </nav>
      <UserMenu />
    </aside>
  );
}
